import os
from datetime import datetime

import aioredis
import uvicorn
from fastapi import FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient

app = FastAPI()

redis_client = aioredis.from_url(os.getenv("REDIS_URL", "redis://localhost"))

mongo_client = AsyncIOMotorClient(os.getenv("MONGO_URL", "mongodb://localhost:27017"))
db = mongo_client.project_db
scan_stats_collection = db["scan_statistics"]


@app.get("/overview")
async def scans_overview():
    date_now = datetime.now().strftime("%Y-%m-%d")
    document = await scan_stats_collection.find_one({"date": date_now})
    document.pop("_id", None)
    # todo insert into redis
    return document


@app.get("/overview/{date}")
async def scans_overview_by_date(date: str):
    if date == "":
        raise HTTPException(status_code=400, detail="Bad request")
    document = await scan_stats_collection.find_one({"date": date}) # take from redis instead
    document.pop("_id", None)
    return document


@app.get("/scanned/{file_hash}")
async def is_scanned(file_hash: str):
    exists = await redis_client.execute_command("BF.EXISTS", "scans_filter", file_hash) == 1
    return {
        "hash": file_hash,
        "scanned": exists
    }

if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8005)
