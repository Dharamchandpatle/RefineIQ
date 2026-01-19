from __future__ import annotations

from typing import Any

from app.services.anomaly_service import get_alerts_from_db
from app.services.dataset_service import get_active_dataset_id
from app.services.forecast_service import get_forecast_from_db
from app.services.kpi_service import get_latest_snapshot
from app.services.recommendation_service import get_recommendations_from_db


def _to_iso(value: Any) -> str | None:
    if value is None:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


def _normalize_recommendations(recommendations: list[dict]) -> list[str]:
    results: list[str] = []
    for item in recommendations:
        text = (
            item.get("recommendation_text")
            or item.get("description")
            or item.get("title")
            or ""
        )
        if text:
            results.append(text)
    return results


def _normalize_trend(trend: list[dict[str, Any]] | None) -> list[dict[str, Any]]:
    if not trend:
        return []
    normalized = []
    for item in trend:
        date_value = item.get("date")
        normalized.append({"date": _to_iso(date_value) if date_value else None, "value": item.get("value")})
    return normalized


async def get_operator_dashboard(db, dataset_id: str | None) -> dict[str, Any]:
    if db is None:
        return {
            "totalActiveAnomalies": 0,
            "highSeverityAlerts": 0,
            "currentSEC": None,
            "predictedEnergyNextDay": None,
            "energyTrend": [],
            "alerts": [],
            "recommendations": [],
        }

    if dataset_id is None:
        dataset_id = await get_active_dataset_id(db)

    snapshot = await get_latest_snapshot(db, dataset_id)
    alerts = await get_alerts_from_db(db, limit=200, dataset_id=dataset_id)
    recommendations = await get_recommendations_from_db(db, limit=50, dataset_id=dataset_id)

    energy_trend = _normalize_trend(snapshot.get("recent_energy_trend"))
    if not energy_trend:
        forecast = await get_forecast_from_db(db, "energy", limit=14, dataset_id=dataset_id)
        energy_trend = [
            {
                "date": record.get("timestamp"),
                "value": record.get("value"),
            }
            for record in (forecast or [])
        ]

    normalized_alerts = [
        {
            "severity": alert.get("severity") or "LOW",
            "message": alert.get("message") or "Anomaly detected in refinery operations.",
            "unit": alert.get("unit_name") or alert.get("source") or "Unknown",
            "timestamp": _to_iso(alert.get("timestamp") or alert.get("date")),
        }
        for alert in (alerts or [])
    ]

    total_anomalies = snapshot.get("total_anomalies")
    if total_anomalies is None:
        total_anomalies = len(normalized_alerts)

    return {
        "totalActiveAnomalies": total_anomalies or 0,
        "highSeverityAlerts": snapshot.get("high_severity_count") or 0,
        "currentSEC": snapshot.get("current_sec") or snapshot.get("avg_sec"),
        "predictedEnergyNextDay": snapshot.get("predicted_energy_next_day"),
        "energyTrend": energy_trend,
        "alerts": normalized_alerts,
        "recommendations": _normalize_recommendations(recommendations),
    }


async def get_admin_dashboard(db, dataset_id: str | None) -> dict[str, Any]:
    if db is None:
        return {
            "totalAnomaliesOverall": 0,
            "averageSEC": None,
            "forecastedEnergy": None,
            "optimizationImpact": None,
            "energyForecast": [],
            "secForecast": [],
            "recommendations": [],
        }

    if dataset_id is None:
        dataset_id = await get_active_dataset_id(db)

    snapshot = await get_latest_snapshot(db, dataset_id)
    energy_forecast = await get_forecast_from_db(db, "energy", limit=120, dataset_id=dataset_id)
    sec_forecast = await get_forecast_from_db(db, "sec", limit=120, dataset_id=dataset_id)
    recommendations = await get_recommendations_from_db(db, limit=100, dataset_id=dataset_id)

    energy_series = [
        {"date": record.get("timestamp"), "value": record.get("value")}
        for record in (energy_forecast or [])
    ]
    sec_series = [
        {"date": record.get("timestamp"), "value": record.get("value")}
        for record in (sec_forecast or [])
    ]

    return {
        "totalAnomaliesOverall": snapshot.get("total_anomalies") or 0,
        "averageSEC": snapshot.get("avg_sec"),
        "forecastedEnergy": snapshot.get("predicted_energy_next_day"),
        "optimizationImpact": None,
        "energyForecast": energy_series,
        "secForecast": sec_series,
        "recommendations": _normalize_recommendations(recommendations),
    }
