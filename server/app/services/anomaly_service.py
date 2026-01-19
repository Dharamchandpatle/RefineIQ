from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from app.config import settings


def _resolve_path(file_name: str) -> Path:
    return Path(settings.data_dir) / file_name


def _find_column(df: pd.DataFrame, candidates: list[str]) -> str | None:
    lowered = {col.lower(): col for col in df.columns}
    for name in candidates:
        if name.lower() in lowered:
            return lowered[name.lower()]
    return None


def _safe_float(value) -> float | None:
    try:
        if pd.isna(value):
            return None
        return float(value)
    except Exception:
        return None


def load_anomalies(limit: int) -> list[dict]:
    file_path = _resolve_path("final_refinery_data_with_anomalies.csv")
    if not file_path.exists():
        return []

    df = pd.read_csv(file_path)
    anomaly_col = _find_column(df, ["anomaly", "is_anomaly", "anomaly_flag"])
    score_col = _find_column(df, ["score", "anomaly_score", "z_score"])
    time_col = _find_column(df, ["timestamp", "time", "date"])

    if anomaly_col:
        df = df[df[anomaly_col] == 1]

    records = []
    for _, row in df.head(limit).iterrows():
        records.append(
            {
                "timestamp": row.get(time_col) if time_col else None,
                "score": _safe_float(row.get(score_col)) if score_col else None,
                "raw": row.to_dict(),
            }
        )

    return records


def build_alerts(limit: int) -> list[dict]:
    anomalies = load_anomalies(limit)
    alerts = []
    for record in anomalies:
        score = record.get("score") or 0
        if score >= 0.9:
            severity = "critical"
        elif score >= 0.7:
            severity = "high"
        elif score >= 0.5:
            severity = "medium"
        else:
            severity = "low"

        alerts.append(
            {
                "message": "Anomaly detected in refinery operations.",
                "severity": severity,
                "timestamp": datetime.now(timezone.utc),
                "source": "anomaly_detection",
            }
        )

    return alerts


async def get_alerts_from_db(db, limit: int, dataset_id: str | None = None) -> list[dict]:
    if db is None:
        return []
    from app.services.dataset_service import get_active_dataset_id

    if dataset_id is None:
        dataset_id = await get_active_dataset_id(db)
    query = {"dataset_id": dataset_id} if dataset_id else {}

    cursor = db.anomaly_alerts.find(query).sort("timestamp", -1).limit(limit)
    alerts = []
    async for item in cursor:
        timestamp = item.get("timestamp") or item.get("date")
        alerts.append(
            {
                "id": str(item.get("_id")),
                "message": item.get("message"),
                "severity": item.get("severity"),
                "timestamp": timestamp,
                "source": item.get("source") or item.get("unit_name"),
            }
        )
    return alerts
