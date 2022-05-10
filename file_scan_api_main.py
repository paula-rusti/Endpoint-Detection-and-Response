import hashlib
import json
import os

import aioredis as aioredis
import pika as pika
import uvicorn
from fastapi import FastAPI, File, HTTPException, Body
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import DuplicateKeyError

app = FastAPI()

redis_client = aioredis.from_url(os.getenv("REDIS_URL", "redis://localhost"))

mongo_client = AsyncIOMotorClient(os.getenv("MONGO_URL", "mongodb://localhost:27017"))
db = mongo_client["project_db"]
files_scan_collection = db["files_scan_collection"]

scans_exchange_name = "scans"
connection = pika.BlockingConnection(pika.ConnectionParameters(host=os.getenv("RABBIT_URL", "localhost")))
channel = connection.channel()
channel.exchange_declare(exchange=scans_exchange_name, exchange_type="fanout")


@app.post("/scan")
async def post_scan(file: bytes = File(...), device_id: str = Body(...)):
    """
    Scans a malicious file and saves result to database.
    """
    verdicts = ["clean", "infected"]

    # compute file hash & sum & verdict
    md5_hash = hashlib.md5(file)
    file_hexdigest = md5_hash.hexdigest()

    # check cache
    cached_value = await redis_client.get(file_hexdigest)
    if cached_value:
        print(f"serving {file_hexdigest} from cache")
        # forward scan to rabbit, so the worker has shit to consume
        channel.basic_publish(
            exchange=scans_exchange_name,
            routing_key="",
            body=cached_value,
        )
        return json.loads(cached_value)

    file_sum = sum(hashlib.md5(file).digest())
    file_verdict = verdicts[file_sum % 2]

    # save result into mongo
    try:
        result = await files_scan_collection.insert_one(
            {"_id": file_hexdigest, "verdict": file_verdict, "dev_id": device_id}
        )
        if not result.acknowledged:
            print("failed to save file with hash", file_hexdigest)
            raise HTTPException(status_code=500, detail="Operation failed")
    except DuplicateKeyError as e:
        print(e)

    # save result in cache
    response = {"file_hash": file_hexdigest, "verdict": file_verdict}
    await redis_client.set(file_hexdigest, json.dumps(response))

    # forward scan to rabbit
    channel.basic_publish(
        exchange=scans_exchange_name,
        routing_key="",
        body=json.dumps(response).encode("utf-8"),
    )

    return response


@app.get("/scan/{md5}")
async def get_scan(md5: str):
    """
    Gets previous scan result from database
    """
    if not md5 or md5 == "":
        raise HTTPException(status_code=400, detail="Bad md5!")

    # poti verifica si cache-ul inainte si sa raspunzi din cache daca vrei

    result = await files_scan_collection.find_one({"_id": md5})
    if result is None:
        raise HTTPException(status_code=404, detail="Not found!")

    return result


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8100)
