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


async def get_forecast_from_db(db, metric: str, limit: int) -> list[dict]:
    if db is None:
        return load_forecast("energy_forecast.csv" if metric == "energy" else "sec_forecast.csv", metric, limit)

    cursor = db.forecast_summary.find({"metric": metric}).sort("created_at", -1).limit(limit)
    records = []
    async for item in cursor:
        records.append(
            {
                "timestamp": item.get("latest_timestamp"),
                "value": item.get("latest_value"),
                "metric": metric,
                "raw": item,
            }
        )

    if not records:
        return load_forecast("energy_forecast.csv" if metric == "energy" else "sec_forecast.csv", metric, limit)

    return records
