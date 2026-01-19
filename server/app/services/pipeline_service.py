from __future__ import annotations

import json
import pickle
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from anyio import to_thread
from joblib import load as joblib_load

if not hasattr(np, "float_"):
    np.float_ = np.float64  # type: ignore[attr-defined]

from app.config import settings

MODEL_DIR = Path(__file__).resolve().parents[1] / "models"
UPLOAD_DIR = Path(settings.data_dir) / "uploads"

_ML_ARTIFACTS: dict[str, Any] = {}


def _ensure_upload_dir() -> None:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _load_pickle(path: Path) -> Any:
    try:
        return joblib_load(path)
    except Exception:
        try:
            with path.open("rb") as handle:
                return pickle.load(handle)
        except Exception:
            with path.open("rb") as handle:
                return pickle.load(handle, encoding="latin1")


def load_ml_artifacts() -> None:
    global _ML_ARTIFACTS
    if _ML_ARTIFACTS:
        return

    feature_config_path = MODEL_DIR / "feature_config.json"
    anomaly_model_path = MODEL_DIR / "anomaly_model.pkl"
    energy_model_path = MODEL_DIR / "energy_forecast_model.pkl"
    sec_model_path = MODEL_DIR / "sec_forecast_model.pkl"

    if not feature_config_path.exists():
        raise FileNotFoundError("feature_config.json not found in app/models")
    if not anomaly_model_path.exists():
        raise FileNotFoundError("anomaly_model.pkl not found in app/models")
    if not energy_model_path.exists():
        raise FileNotFoundError("energy_forecast_model.pkl not found in app/models")
    if not sec_model_path.exists():
        raise FileNotFoundError("sec_forecast_model.pkl not found in app/models")

    feature_config = json.loads(feature_config_path.read_text(encoding="utf-8"))

    _ML_ARTIFACTS = {
        "feature_config": feature_config,
        "anomaly_model": _load_pickle(anomaly_model_path),
        "energy_model": _load_pickle(energy_model_path),
        "sec_model": _load_pickle(sec_model_path),
    }


def _get_ml_artifacts() -> dict[str, Any]:
    if not _ML_ARTIFACTS:
        load_ml_artifacts()
    return _ML_ARTIFACTS


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


def _merge_column_map(config_map: dict[str, list[str]] | None) -> dict[str, list[str]]:
    default_map = {
        "electricity_kwh": ["electricity_kwh", "electricity", "elec_kwh", "power_kwh", "energy_kwh"],
        "steam_usage": ["steam_usage", "steam", "steam_kwh"],
        "fuel_usage": ["fuel_usage", "fuel", "fuel_kwh"],
        "production_tons": ["production_tons", "production", "output_tons"],
        "unit_name": ["unit_name", "unit", "process_unit", "unitid"],
        "date": ["date", "timestamp", "time", "datetime"],
        "total_energy": ["total_energy", "total_energy_kwh", "energy_total"],
        "SEC": ["sec", "specific_energy_consumption", "sec_value"],
    }

    merged = {key: list(value) for key, value in default_map.items()}
    if config_map:
        for key, candidates in config_map.items():
            normalized = [str(item).strip() for item in candidates or []]
            existing = merged.get(key, [])
            merged[key] = normalized + [item for item in existing if item not in normalized]

    return merged


def _map_and_engineer(df: pd.DataFrame, feature_config: dict[str, Any]) -> pd.DataFrame:
    df = df.copy()

    column_map = _merge_column_map(feature_config.get("column_map"))
    for standard_col, possible_cols in column_map.items():
        mapped = _find_column(df, possible_cols)
        if mapped:
            df[standard_col] = df[mapped]

    required = ["electricity_kwh", "steam_usage", "fuel_usage", "production_tons", "unit_name", "date"]
    missing = [col for col in required if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns after auto-mapping: {missing}")

    df["date"] = pd.to_datetime(df["date"], errors="coerce", dayfirst=True)
    df = df.dropna(subset=["date"])

    for col in ["electricity_kwh", "steam_usage", "fuel_usage", "production_tons", "total_energy", "SEC"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    df["electricity_kwh"] = df["electricity_kwh"].fillna(0)
    df["steam_usage"] = df["steam_usage"].fillna(0)
    df["fuel_usage"] = df["fuel_usage"].fillna(0)

    df["total_energy"] = df["electricity_kwh"] + df["steam_usage"] + df["fuel_usage"]
    production = df["production_tons"].replace(0, pd.NA)
    df["SEC"] = df["total_energy"] / production

    df = df.dropna(subset=["total_energy", "SEC"]).copy()
    if df.empty:
        raise ValueError("Dataset is empty after cleaning. Check date parsing or numeric values.")

    return df


def _severity_from_sec(sec_value: float | None, sec_mean: float | None, rules: dict[str, float]) -> str:
    if sec_value is None or sec_mean is None:
        return "LOW"

    high = rules.get("high", 1.5)
    medium = rules.get("medium", 1.2)
    low = rules.get("low", 1.0)

    if sec_value >= sec_mean * high:
        return "HIGH"
    if sec_value >= sec_mean * medium:
        return "MEDIUM"
    if sec_value >= sec_mean * low:
        return "LOW"
    return "NORMAL"


def _run_anomaly_detection(df: pd.DataFrame, model, feature_config: dict[str, Any]) -> pd.DataFrame:
    df = df.copy()
    features = [col for col in feature_config.get("features", []) if col in df.columns]
    if not features:
        raise ValueError("No feature columns found for anomaly inference")

    feature_matrix = df[features].fillna(0)
    preds = model.predict(feature_matrix)
    preds_array = np.array(preds)
    anomalies = np.where(preds_array == -1, 1, np.where(preds_array == 1, 0, preds_array))
    df["anomaly"] = anomalies.astype(int)
    return df


def _predict_with_model(model, future_df: pd.DataFrame) -> list[tuple[Any, float]]:
    try:
        output = model.predict(future_df)
    except Exception:
        return []

    if isinstance(output, pd.DataFrame):
        if "yhat" in output.columns:
            values = output["yhat"].tolist()
        else:
            numeric_cols = output.select_dtypes(include=[np.number]).columns
            if not len(numeric_cols):
                return []
            values = output[numeric_cols[0]].tolist()
        ds_values = output["ds"].tolist() if "ds" in output.columns else future_df["ds"].tolist()
    else:
        values = list(output)
        ds_values = future_df["ds"].tolist()

    results = []
    for ds_value, yhat in zip(ds_values, values):
        results.append((ds_value, float(yhat)))
    return results


def _run_forecast(df: pd.DataFrame, energy_model, sec_model) -> dict[str, Any]:
    if "date" not in df.columns or df["date"].dropna().empty:
        return {"forecast_results": [], "predicted_energy_next_day": None}

    last_date = df["date"].max()
    if pd.isna(last_date):
        return {"forecast_results": [], "predicted_energy_next_day": None}

    future_dates = pd.date_range(last_date, periods=31, freq="D")[1:]
    future_df = pd.DataFrame({"ds": future_dates})

    energy_preds = _predict_with_model(energy_model, future_df)
    sec_preds = _predict_with_model(sec_model, future_df)

    energy_records = [{"type": "energy", "ds": ds, "yhat": yhat} for ds, yhat in energy_preds]
    sec_records = [{"type": "sec", "ds": ds, "yhat": yhat} for ds, yhat in sec_preds]

    predicted_energy_next_day = energy_records[0]["yhat"] if energy_records else None

    return {
        "forecast_results": energy_records + sec_records,
        "predicted_energy_next_day": predicted_energy_next_day,
    }


def _build_alerts(df: pd.DataFrame, feature_config: dict[str, Any]) -> list[dict[str, Any]]:
    sec_mean = feature_config.get("sec_mean")
    sec_mean_value = _safe_float(sec_mean) if sec_mean is not None else _safe_float(df["SEC"].mean())
    rules = feature_config.get("severity_rules", {})

    alerts = []
    anomalies = df[df["anomaly"] == 1]
    for _, row in anomalies.iterrows():
        sec_value = _safe_float(row.get("SEC"))
        severity = _severity_from_sec(sec_value, sec_mean_value, rules)
        alerts.append(
            {
                "unit_name": row.get("unit_name") or "Unknown",
                "date": row.get("date"),
                "sec": sec_value,
                "severity": severity,
                "message": "Anomaly detected in refinery operations.",
                "timestamp": row.get("date"),
            }
        )
    return alerts


def _build_recommendations(df: pd.DataFrame, alerts: list[dict[str, Any]], feature_config: dict[str, Any]) -> list[dict[str, Any]]:
    rec_map = feature_config.get("recommendations", {})
    recs = []

    if alerts:
        for alert in alerts:
            severity = alert.get("severity") or "NORMAL"
            recommendation_text = rec_map.get(severity, "Review operating parameters.")
            recs.append(
                {
                    "unit_name": alert.get("unit_name") or "Unknown",
                    "severity": severity,
                    "recommendation_text": recommendation_text,
                    "title": "Operational Recommendation",
                    "description": recommendation_text,
                    "impact": severity.title(),
                    "timestamp": datetime.now(timezone.utc),
                }
            )
    else:
        recommendation_text = rec_map.get("NORMAL", "Operation normal")
        recs.append(
            {
                "unit_name": "All Units",
                "severity": "NORMAL",
                "recommendation_text": recommendation_text,
                "title": "Operational Recommendation",
                "description": recommendation_text,
                "impact": "Low",
                "timestamp": datetime.now(timezone.utc),
            }
        )

    return recs


def save_uploaded_file(file_bytes: bytes, filename: str) -> Path:
    _ensure_upload_dir()
    safe_name = Path(filename).name
    target = UPLOAD_DIR / safe_name
    target.write_bytes(file_bytes)
    return target


def _execute_pipeline(file_path: Path) -> dict[str, Any]:
    artifacts = _get_ml_artifacts()
    feature_config = artifacts["feature_config"]

    df = pd.read_csv(file_path)
    if df.empty:
        raise ValueError("Uploaded CSV is empty")

    df = _clean_dataframe(df)
    df = _map_and_engineer(df, feature_config)
    df = _run_anomaly_detection(df, artifacts["anomaly_model"], feature_config)

    alerts = _build_alerts(df, feature_config)
    recommendations = _build_recommendations(df, alerts, feature_config)
    forecast_output = _run_forecast(df, artifacts["energy_model"], artifacts["sec_model"])

    total_records = int(len(df.index))
    total_anomalies = int(df["anomaly"].sum())
    high_severity = sum(1 for alert in alerts if alert.get("severity") == "HIGH")
    avg_sec = _safe_float(df["SEC"].mean())
    total_energy = _safe_float(df["total_energy"].sum())
    avg_energy = _safe_float(df["total_energy"].mean())
    current_sec = None
    recent_energy_trend = []
    if "date" in df.columns:
        df_sorted = df.sort_values("date")
        if not df_sorted.empty:
            last_row = df_sorted.iloc[-1]
            current_sec = _safe_float(last_row.get("SEC"))

        if "total_energy" in df_sorted.columns:
            trend_df = df_sorted.copy()
            trend_df["trend_date"] = trend_df["date"].dt.date
            grouped = trend_df.groupby("trend_date", dropna=True)["total_energy"].mean().reset_index()
            grouped = grouped.sort_values("trend_date").tail(14)
            recent_energy_trend = [
                {
                    "date": record.get("trend_date").isoformat() if record.get("trend_date") else None,
                    "value": _safe_float(record.get("total_energy")) or 0,
                }
                for record in grouped.to_dict(orient="records")
            ]
    anomaly_rate = float(total_anomalies) / float(total_records) if total_records else None

    kpi_snapshot = {
        "total_energy": total_energy,
        "avg_energy": avg_energy,
        "avg_sec": avg_sec,
        "anomaly_rate": anomaly_rate,
        "total_records": total_records,
        "total_anomalies": total_anomalies,
        "high_severity_count": high_severity,
        "predicted_energy_next_day": forecast_output["predicted_energy_next_day"],
        "current_sec": current_sec,
        "recent_energy_trend": recent_energy_trend,
        "timestamp": datetime.now(timezone.utc),
    }

    return {
        "kpi_snapshot": kpi_snapshot,
        "alerts": alerts,
        "recommendations": recommendations,
        "forecast_results": forecast_output["forecast_results"],
    }


async def run_pipeline(file_path: Path, db, dataset_id: str | None = None) -> None:
    results = await to_thread.run_sync(_execute_pipeline, file_path)
    if db is None:
        return

    dataset_id = dataset_id or "default"

    results["kpi_snapshot"]["dataset_id"] = dataset_id
    await db.kpi_snapshots.insert_one(results["kpi_snapshot"])

    await db.anomaly_alerts.delete_many({"dataset_id": dataset_id})
    if results["alerts"]:
        for alert in results["alerts"]:
            alert["dataset_id"] = dataset_id
            alert["source"] = alert.get("unit_name")
        await db.anomaly_alerts.insert_many(results["alerts"])

    await db.recommendations.delete_many({"dataset_id": dataset_id})
    if results["recommendations"]:
        for rec in results["recommendations"]:
            rec["dataset_id"] = dataset_id
        await db.recommendations.insert_many(results["recommendations"])

    forecast_results = results.get("forecast_results") or []
    await db.forecast_results.delete_many({"dataset_id": dataset_id})
    if forecast_results:
        for record in forecast_results:
            record["dataset_id"] = dataset_id
        await db.forecast_results.insert_many(forecast_results)
