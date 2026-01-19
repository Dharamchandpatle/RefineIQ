from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings

client: AsyncIOMotorClient | None = None
_db = None


async def connect_to_mongo() -> None:
    global client, _db
    client = AsyncIOMotorClient(settings.mongo_uri)
    _db = client[settings.mongo_db]
    await client.admin.command("ping")


async def close_mongo_connection() -> None:
    if client:
        client.close()


def get_db():
    if _db is None:
        raise RuntimeError("MongoDB connection is not initialized")
    return _db
