import json
import os
from datetime import datetime

import pika
from pymongo import MongoClient
import redis


def listen_for_scan_messages():
    # redis
    redis_client = redis.Redis(host=os.getenv("REDIS_HOST", "localhost"), port=6379, db=0)
    # mongo
    mongo_client = MongoClient(os.getenv("MONGO_URL", "mongodb://localhost:27017"))
    db = mongo_client["project_db"]
    scan_stats_collection = db["scan_statistics"]
    # rabbit
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=os.getenv("RABBIT_URL", "localhost")))
    channel = connection.channel()

    channel.exchange_declare(exchange="scans", exchange_type="fanout")

    result = channel.queue_declare(queue="", exclusive=True)
    queue_name = result.method.queue

    channel.queue_bind(exchange="scans", queue=queue_name)

    print(" [*] Waiting for scans. To exit press CTRL+C")

    # called for every received message in the rabbit queue
    def callback(ch, method, properties, body):
        scan_body = json.loads(body.decode("utf-8"))
        date_now = datetime.now().strftime("%Y-%m-%d")

        # get overview doc from db
        overview_document = scan_stats_collection.find_one({"date": date_now})
        if overview_document is None:
            overview_document = {
                "date": date_now,
                "infected_count": 0,
                "clean_count": 0
            }

        # count infected/clean docs
        scan_verdict = scan_body["verdict"]
        if scan_verdict == "infected":
            overview_document["infected_count"] += 1
        elif scan_verdict == "clean":
            overview_document["clean_count"] += 1

        scan_stats_collection.update_one({"date": date_now},
                                         {"$set": {"infected_count": overview_document["infected_count"],
                                                   "clean_count": overview_document["clean_count"]}}, upsert=True)
        print(overview_document)
        print(" [x] %r" % scan_body)
        redis_client.execute_command("BF.ADD", "scans_filter", scan_body["file_hash"])

    channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
    channel.start_consuming()


if __name__ == "__main__":
    listen_for_scan_messages()
