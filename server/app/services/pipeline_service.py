from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd

from app.config import settings

UPLOAD_DIR = Path(settings.data_dir) / "uploads"


def _ensure_upload_dir() -> None:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _safe_float(value) -> float | None:
    try:
        if pd.isna(value):
            return None
        return float(value)
    except Exception:
        return None


def _find_column(df: pd.DataFrame, candidates: list[str]) -> str | None:
    lowered = {col.lower().strip(): col for col in df.columns}
    for name in candidates:
        if name.lower() in lowered:
            return lowered[name.lower()]
    return None


def _clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [str(col).strip() for col in df.columns]
    df = df.dropna(axis=1, how="all").dropna(axis=0, how="all")
    return df


def _compute_kpi_from_df(df: pd.DataFrame) -> dict[str, Any]:
    energy_col = _find_column(
        df,
        ["energy", "energy_consumption", "total_energy", "energy_kwh", "consumption"],
    )
    sec_col = _find_column(df, ["sec", "specific_energy_consumption", "sec_value"])
    anomaly_col = _find_column(df, ["anomaly", "is_anomaly", "anomaly_flag"])

    total_energy = _safe_float(df[energy_col].sum()) if energy_col else None
    avg_energy = _safe_float(df[energy_col].mean()) if energy_col else None
    avg_sec = _safe_float(df[sec_col].mean()) if sec_col else None

    anomaly_rate = None
    if anomaly_col and len(df.index) > 0:
        try:
            anomaly_rate = float(df[anomaly_col].sum()) / float(len(df.index))
        except Exception:
            anomaly_rate = None

    return {
        "total_energy": total_energy,
        "avg_energy": avg_energy,
        "avg_sec": avg_sec,
        "anomaly_rate": anomaly_rate,
        "timestamp": datetime.now(timezone.utc),
    }


def _build_anomalies_from_df(df: pd.DataFrame, limit: int = 250) -> list[dict[str, Any]]:
    anomaly_col = _find_column(df, ["anomaly", "is_anomaly", "anomaly_flag"])
    score_col = _find_column(df, ["score", "anomaly_score", "z_score"])
    time_col = _find_column(df, ["timestamp", "time", "date"])

    if anomaly_col:
        df = df[df[anomaly_col] == 1]

    records: list[dict[str, Any]] = []
    for _, row in df.head(limit).iterrows():
        records.append(
            {
                "timestamp": row.get(time_col) if time_col else None,
                "score": _safe_float(row.get(score_col)) if score_col else None,
                "raw": row.to_dict(),
            }
        )
    return records


def _forecast_summary_from_df(df: pd.DataFrame, metric: str) -> dict[str, Any]:
    metric_col = _find_column(df, [metric, "value", "forecast", f"{metric}_forecast"])
    time_col = _find_column(df, ["timestamp", "time", "date"])

    if not metric_col:
        return {
            "metric": metric,
            "count": 0,
            "latest_value": None,
            "latest_timestamp": None,
            "created_at": datetime.now(timezone.utc),
        }

    last_row = df.tail(1)
    latest_value = _safe_float(last_row[metric_col].iloc[0])
    latest_timestamp = last_row[time_col].iloc[0] if time_col else None

    return {
        "metric": metric,
        "count": len(df.index),
        "latest_value": latest_value,
        "latest_timestamp": latest_timestamp,
        "created_at": datetime.now(timezone.utc),
    }


def _build_recommendations_from_df(df: pd.DataFrame) -> list[dict[str, Any]]:
    recs: list[dict[str, Any]] = []
    avg_sec = _safe_float(df[_find_column(df, ["sec", "specific_energy_consumption", "sec_value"])].mean()) if _find_column(df, ["sec", "specific_energy_consumption", "sec_value"]) else None

    if avg_sec and avg_sec > 0:
        recs.append(
            {
                "title": "Reduce SEC variance",
                "description": "Review heat exchanger efficiency and steam usage to stabilize SEC trends.",
                "impact": "Moderate",
                "timestamp": datetime.now(timezone.utc),
            }
        )

    recs.append(
        {
            "title": "Optimize energy scheduling",
            "description": "Shift high-energy operations to off-peak windows where feasible.",
            "impact": "High",
            "timestamp": datetime.now(timezone.utc),
        }
    )

    return recs


def _try_external_pipeline(df: pd.DataFrame) -> dict[str, Any] | None:
    try:
        import importlib

        module = importlib.import_module("app.services.ml_pipeline")
        run_anomaly_detection = getattr(module, "run_anomaly_detection", None)
        run_forecast_models = getattr(module, "run_forecast_models", None)
        run_recommendation_engine = getattr(module, "run_recommendation_engine", None)
    except Exception:
        return None

    if not (run_anomaly_detection and run_forecast_models and run_recommendation_engine):
        return None

    return {
        "anomalies": run_anomaly_detection(df),
        "forecasts": run_forecast_models(df),
        "recommendations": run_recommendation_engine(df),
    }


def save_uploaded_file(file_bytes: bytes, filename: str) -> Path:
    _ensure_upload_dir()
    safe_name = Path(filename).name
    target = UPLOAD_DIR / safe_name
    target.write_bytes(file_bytes)
    return target


def run_pipeline(file_path: Path, db) -> None:
    df = pd.read_csv(file_path)
    if df.empty:
        raise ValueError("Uploaded CSV is empty")

    df = _clean_dataframe(df)

    external_result = _try_external_pipeline(df)

    kpi_snapshot = _compute_kpi_from_df(df)
    anomalies = external_result["anomalies"] if external_result else _build_anomalies_from_df(df)
    recommendations = external_result["recommendations"] if external_result else _build_recommendations_from_df(df)

    forecasts = external_result["forecasts"] if external_result else {
        "energy": _forecast_summary_from_df(df, "energy"),
        "sec": _forecast_summary_from_df(df, "sec"),
    }

    if db is None:
        return

    db.kpi_snapshots.insert_one(kpi_snapshot)

    if anomalies:
        db.anomaly_alerts.delete_many({})
        db.anomaly_alerts.insert_many(anomalies)

    if recommendations:
        db.recommendations.delete_many({})
        db.recommendations.insert_many(recommendations)

    db.forecast_summaries.delete_many({})
    if isinstance(forecasts, dict):
        db.forecast_summaries.insert_many(list(forecasts.values()))
    elif isinstance(forecasts, list):
        db.forecast_summaries.insert_many(forecasts)
