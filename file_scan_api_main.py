import hashlib
import json
import os

import aioredis as aioredis
import pika as pika
import uvicorn
from fastapi import FastAPI, File, HTTPException, Body
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import DuplicateKeyError

from constants import VERDICTS

app = FastAPI()

redis_client = aioredis.from_url(os.getenv("REDIS_URL", "redis://localhost"))

mongo_client = AsyncIOMotorClient(
    os.getenv("MONGO_URL", "mongodb://localhost:27017")
)  # connect to local mongo instance
db = mongo_client["project_db"]  # 1 single db
files_scan_collection = db[
    "files_scan_collection"
]  # 2 collection, 1 for scan engine and the other for scan stats

scans_exchange_name = "scans"
def check_bin_for_problems(md5 : str):
    if md5 == 0:
        print("LOG: Files is either empty at all or file has problems")
        print("Check file")


@app.post("/scan")
async def post_scan(file: bytes = File(...), device_id: str = Body(...)):
    # add device_id to request body (maybe the ui will read some device specific info and embed it to the request )
    """Scans a malicious file and saves result to database"""
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=os.getenv("RABBIT_URL", "localhost"))
    )
    channel = connection.channel()
    channel.exchange_declare(exchange=scans_exchange_name, exchange_type="fanout")

    # compute file hash & sum & verdict
    md5_hash = hashlib.md5(file)
    file_hexdigest = md5_hash.hexdigest()

    # check cache
    cached_value = await redis_client.get(
        file_hexdigest
    )  # redis format: file_hash: {file_hash: value, verdict: value}
    if cached_value:
        print(f"serving {file_hexdigest} from cache")
        # if the file was previously scanned (thus we were able to answer from cache) => we cand just forward the scan result (mongo doc) to rabbit so it will be further consumed by the worker
        channel.basic_publish(
            exchange=scans_exchange_name,
            routing_key="",
            body=cached_value,
        )
        return json.loads(cached_value)  # return the scan result

    # else we have to trigger the dummy logic on the current file
    file_sum = sum(hashlib.md5(file).digest())
    # See what the files status is
    file_verdict = VERDICTS[file_sum % 2]

    # and further save result into mongo files_scan_collection
    try:
        result = await files_scan_collection.insert_one(
            {"_id": file_hexdigest, "verdict": file_verdict, "dev_id": device_id}
        )
        if (
            not result.acknowledged
        ):  # if we were unable to save the data to mongo and data was lost
            print("failed to save file with hash", file_hexdigest)
            raise HTTPException(status_code=500, detail="Operation failed")
    except DuplicateKeyError as e:
        print(e)

    # and also save result in cache
    response = {"file_hash": file_hexdigest, "verdict": file_verdict}
    await redis_client.set(file_hexdigest, json.dumps(response))

    # and finally forward scan to rabbit
    channel.basic_publish(
        exchange=scans_exchange_name,
        routing_key="",
        body=json.dumps(response).encode("utf-8"),
    )

    return response


@app.get("/scan/{md5}")
async def get_scan(md5: str):
    """Gets previous scan result from database"""
    if not md5 or md5 == "":
        raise HTTPException(status_code=400, detail="Bad md5!")
    result = await files_scan_collection.find_one(
        {"_id": md5}
    )  # look in mongo instead of redis bcs the keys expire there :( (LRU cache)
    if result is None:
        raise HTTPException(status_code=404, detail="Not found!")

    return result


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8100)
