from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId


async def set_active_dataset(db, dataset_id: str) -> None:
    await db.dataset_state.update_one(
        {"_id": "active"},
        {
            "$set": {
                "dataset_id": dataset_id,
                "updated_at": datetime.now(timezone.utc),
            }
        },
        upsert=True,
    )


async def get_active_dataset_id(db) -> str | None:
    if db is None:
        return None
    state = await db.dataset_state.find_one({"_id": "active"})
    if not state:
        return None
    return state.get("dataset_id")


def _infer_category(name: str) -> str:
    cleaned = name.replace(".csv", "").strip()
    for sep in ["_", "-", "."]:
        if sep in cleaned:
            return cleaned.split(sep)[0].strip().title() or "General"
    return "General"


async def create_dataset_record(db, filename: str) -> dict[str, Any]:
    payload = {
        "name": filename,
        "category": _infer_category(filename),
        "status": "processed",
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.datasets.insert_one(payload)
    dataset_id = str(result.inserted_id)
    await set_active_dataset(db, dataset_id)
    return {"id": dataset_id, **payload}


async def list_datasets(db) -> list[dict[str, Any]]:
    if db is None:
        return []
    cursor = db.datasets.find().sort("created_at", -1)
    datasets = []
    async for item in cursor:
        datasets.append(
            {
                "id": str(item.get("_id")),
                "name": item.get("name"),
                "category": item.get("category") or "General",
                "status": item.get("status") or "processed",
                "created_at": item.get("created_at"),
            }
        )
    return datasets


async def delete_dataset(db, dataset_id: str) -> dict[str, Any]:
    if db is None:
        return {"deleted": False, "active_dataset_id": None}

    try:
        object_id = ObjectId(dataset_id)
    except InvalidId as exc:
        raise ValueError("Invalid dataset id") from exc

    await db.datasets.delete_one({"_id": object_id})
    await db.kpi_snapshots.delete_many({"dataset_id": dataset_id})
    await db.anomaly_alerts.delete_many({"dataset_id": dataset_id})
    await db.forecast_results.delete_many({"dataset_id": dataset_id})
    await db.recommendations.delete_many({"dataset_id": dataset_id})

    active = await get_active_dataset_id(db)
    active_dataset_id = active
    if active == dataset_id:
        latest = await db.datasets.find_one({}, sort=[("created_at", -1)])
        active_dataset_id = str(latest.get("_id")) if latest else None
        if active_dataset_id:
            await set_active_dataset(db, active_dataset_id)
        else:
            await db.dataset_state.delete_one({"_id": "active"})

    return {"deleted": True, "active_dataset_id": active_dataset_id}