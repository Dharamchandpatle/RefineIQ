from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from app.config import settings


def _resolve_path(file_name: str) -> Path:
    return Path(settings.data_dir) / file_name


def load_recommendations(limit: int) -> list[dict]:
    file_path = _resolve_path("optimization_recommendations.csv")
    if not file_path.exists():
        return []

    df = pd.read_csv(file_path)
    records = []
    for _, row in df.head(limit).iterrows():
        record = row.to_dict()
        records.append(
            {
                "title": record.get("title") or record.get("recommendation") or "Optimization",
                "description": record.get("description") or record.get("details"),
                "impact": record.get("impact") or record.get("benefit"),
                "timestamp": datetime.now(timezone.utc),
            }
        )

    return records


async def get_recommendations_from_db(db, limit: int, dataset_id: str | None = None) -> list[dict]:
    if db is None:
        return []
    from app.services.dataset_service import get_active_dataset_id

    if dataset_id is None:
        dataset_id = await get_active_dataset_id(db)
    query = {"dataset_id": dataset_id} if dataset_id else {}

    cursor = db.recommendations.find(query).sort("timestamp", -1).limit(limit)
    recommendations = []
    async for item in cursor:
        recommendations.append(
            {
                "id": str(item.get("_id")),
                "title": item.get("title"),
                "description": item.get("description"),
                "impact": item.get("impact"),
                "timestamp": item.get("timestamp"),
            }
        )

    return recommendations
