from __future__ import annotations

from datetime import datetime, timezone


def _empty_summary() -> dict:
    return {
        "total_energy": None,
        "avg_energy": None,
        "avg_sec": None,
        "anomaly_rate": None,
        "total_records": None,
        "total_anomalies": None,
        "high_severity_count": None,
        "predicted_energy_next_day": None,
        "current_sec": None,
        "recent_energy_trend": [],
        "last_updated": datetime.now(timezone.utc),
    }


async def get_latest_snapshot(db, dataset_id: str | None = None) -> dict:
    if db is None:
        return _empty_summary()
    from app.services.dataset_service import get_active_dataset_id

    if dataset_id is None:
        dataset_id = await get_active_dataset_id(db)
    query = {"dataset_id": dataset_id} if dataset_id else {}

    snapshot = await db.kpi_snapshots.find_one(query, sort=[("timestamp", -1)])
    if snapshot:
        return {
            "total_energy": snapshot.get("total_energy"),
            "avg_energy": snapshot.get("avg_energy"),
            "avg_sec": snapshot.get("avg_sec"),
            "anomaly_rate": snapshot.get("anomaly_rate"),
            "total_records": snapshot.get("total_records"),
            "total_anomalies": snapshot.get("total_anomalies"),
            "high_severity_count": snapshot.get("high_severity_count"),
            "predicted_energy_next_day": snapshot.get("predicted_energy_next_day"),
            "current_sec": snapshot.get("current_sec"),
            "recent_energy_trend": snapshot.get("recent_energy_trend") or [],
            "last_updated": snapshot.get("timestamp") or snapshot.get("last_updated"),
            "id": str(snapshot.get("_id")),
        }

    return _empty_summary()


async def list_snapshots(db, limit: int) -> list[dict]:
    if db is None:
        return []
    from app.services.dataset_service import get_active_dataset_id

    dataset_id = await get_active_dataset_id(db)
    query = {"dataset_id": dataset_id} if dataset_id else {}

    cursor = db.kpi_snapshots.find(query).sort("timestamp", -1).limit(limit)
    snapshots = []
    async for item in cursor:
        snapshots.append(
            {
                "id": str(item.get("_id")),
                "total_energy": item.get("total_energy"),
                "avg_energy": item.get("avg_energy"),
                "avg_sec": item.get("avg_sec"),
                "anomaly_rate": item.get("anomaly_rate"),
                "total_records": item.get("total_records"),
                "total_anomalies": item.get("total_anomalies"),
                "high_severity_count": item.get("high_severity_count"),
                "predicted_energy_next_day": item.get("predicted_energy_next_day"),
                "last_updated": item.get("timestamp") or item.get("last_updated"),
            }
        )
    return snapshots
