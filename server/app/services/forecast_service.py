from __future__ import annotations

from pathlib import Path

import pandas as pd

from app.config import settings


def _resolve_path(file_name: str) -> Path:
    return Path(settings.data_dir) / file_name


def load_forecast(file_name: str, metric: str, limit: int) -> list[dict]:
    file_path = _resolve_path(file_name)
    if not file_path.exists():
        return []

    df = pd.read_csv(file_path)
    records = []
    for _, row in df.head(limit).iterrows():
        record = row.to_dict()
        records.append(
            {
                "timestamp": record.get("timestamp") or record.get("date") or record.get("time"),
                "value": record.get("value") or record.get(metric) or record.get("forecast"),
                "metric": metric,
                "raw": record,
            }
        )

    return records


async def get_forecast_from_db(db, metric: str, limit: int, dataset_id: str | None = None) -> list[dict]:
    if db is None:
        return []
    from app.services.dataset_service import get_active_dataset_id

    if dataset_id is None:
        dataset_id = await get_active_dataset_id(db)
    query = {}
    if dataset_id:
        query["dataset_id"] = dataset_id

    records = []
    cursor = db.forecast_results.find({"type": metric, **query}).sort("ds", -1).limit(limit)
    async for item in cursor:
        ds_value = item.get("ds")
        if hasattr(ds_value, "isoformat"):
            ds_value = ds_value.isoformat()
        records.append(
            {
                "timestamp": ds_value,
                "value": item.get("yhat"),
                "metric": metric,
                "raw": item,
            }
        )

    if records:
        return list(reversed(records))

    return []
