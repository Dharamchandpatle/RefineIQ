from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId

import requests

from app.config import settings


def _build_system_prompt(context: dict[str, Any] | None, user_role: str | None = None) -> str:
    context = context or {}
    kpis = context.get("kpis") or {}
    alerts = context.get("alerts") or []
    forecasts = context.get("forecast") or []
    recommendations = context.get("recommendations") or []
    role = (user_role or "operator").lower()
    tone = (
        "Use concise operational language for field engineers."
        if role == "operator"
        else "Use concise decision-support language for leadership."
    )

    return (
        "You are an industrial refinery energy analyst."
        " Use ONLY the data provided. Do not invent values."
        " If data is missing, clearly say so."
        " Never expose raw database documents or JSON."
        f"\nUser role: {role}. {tone}"
        f"\nKPIs: {kpis}"
        f"\nAlerts: {alerts}"
        f"\nForecast: {forecasts}"
        f"\nRecommendations: {recommendations}"
        "\nKeep responses concise and actionable."
    )


def _generate_via_rest(
    model_name: str, system_prompt: str, message: str, generation_config: dict[str, Any] | None = None
) -> tuple[str, str]:
    normalized = model_name.replace("models/", "").strip()
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{normalized}:generateContent"
    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": system_prompt}]},
            {"role": "user", "parts": [{"text": message}]},
        ]
    }
    if generation_config:
        payload["generationConfig"] = generation_config
    response = requests.post(
        url,
        headers={
            "Content-Type": "application/json",
            "X-goog-api-key": settings.gemini_api_key,
        },
        json=payload,
        timeout=30,
    )
    if not response.ok:
        try:
            error_payload = response.json()
            error_message = error_payload.get("error", {}).get("message", "")
        except Exception:
            error_message = response.text
        raise ValueError(f"Gemini API error {response.status_code}: {error_message}")
    data = response.json()
    candidates = data.get("candidates") or []
    if not candidates:
        raise ValueError("No candidates returned from Gemini API")
    parts = candidates[0].get("content", {}).get("parts", [])
    if not parts:
        raise ValueError("No content parts returned from Gemini API")
    return parts[0].get("text", ""), normalized


def generate_reply(message: str, context: dict[str, Any] | None) -> tuple[str, str | None]:
    if not settings.gemini_api_key:
        return (
            "Gemini API key is not configured. Set GEMINI_API_KEY in the server .env file.",
            None,
        )

    if not settings.gemini_model:
        return (
            "Gemini model is not configured. Set GEMINI_MODEL in the server .env file.",
            None,
        )

    system_prompt = _build_system_prompt(context)
    try:
        model_name = settings.gemini_model or "gemini-1.5-flash"
        response_text, model_used = _generate_via_rest(model_name, system_prompt, message)
        return response_text, model_used
    except Exception:
        return (
            "Gemini model is unavailable. Verify GEMINI_API_KEY and GEMINI_MODEL in the server .env file.",
            None,
        )


def _classify_sources(question: str) -> list[str]:
    lowered = question.lower()
    sources: list[str] = []
    if any(term in lowered for term in ["sec", "efficiency"]):
        sources.append("kpi")
    if any(term in lowered for term in ["anomaly", "alert", "fault"]):
        sources.append("alerts")
    if any(term in lowered for term in ["forecast", "predict", "future", "tomorrow"]):
        sources.append("forecast")
    if any(term in lowered for term in ["optimize", "reduce", "recommend"]):
        sources.append("recommendations")

    if not sources:
        sources = ["kpi", "alerts", "forecast", "recommendations"]
    return sources


def _kpi_has_data(kpis: dict[str, Any]) -> bool:
    if not kpis:
        return False
    for key in [
        "total_energy",
        "avg_energy",
        "avg_sec",
        "anomaly_rate",
        "total_records",
        "total_anomalies",
        "high_severity_count",
        "predicted_energy_next_day",
        "current_sec",
    ]:
        if kpis.get(key) is not None:
            return True
    return bool(kpis.get("recent_energy_trend"))


async def _validate_dataset(db, dataset_id: str) -> None:
    try:
        object_id = ObjectId(dataset_id)
    except InvalidId as exc:
        raise ValueError("Invalid dataset id") from exc
    dataset = await db.datasets.find_one({"_id": object_id})
    if not dataset:
        raise ValueError("Dataset not found")


async def build_chat_context(db, dataset_id: str, question: str) -> tuple[dict[str, Any], list[str]]:
    from app.services.anomaly_service import get_alerts_from_db
    from app.services.forecast_service import get_forecast_from_db
    from app.services.kpi_service import get_latest_snapshot
    from app.services.recommendation_service import get_recommendations_from_db

    sources = _classify_sources(question)
    context: dict[str, Any] = {"dataset_id": dataset_id}

    if "kpi" in sources:
        context["kpis"] = await get_latest_snapshot(db, dataset_id)
    if "alerts" in sources:
        context["alerts"] = await get_alerts_from_db(db, 10, dataset_id)
    if "recommendations" in sources:
        context["recommendations"] = await get_recommendations_from_db(db, 5, dataset_id)
    if "forecast" in sources:
        lowered = question.lower()
        metrics = []
        if "sec" in lowered:
            metrics.append("sec")
        if "energy" in lowered or "forecast" in lowered or "tomorrow" in lowered:
            metrics.append("energy")
        if not metrics:
            metrics = ["energy"]
        forecast_records: list[dict[str, Any]] = []
        for metric in metrics:
            records = await get_forecast_from_db(db, metric, limit=14, dataset_id=dataset_id)
            forecast_records.extend(
                {
                    "timestamp": item.get("timestamp"),
                    "value": item.get("value"),
                    "metric": item.get("metric"),
                }
                for item in records
            )
        context["forecast"] = forecast_records

    return context, sources


def _calculate_confidence(sources: list[str], context: dict[str, Any]) -> str:
    availability = []
    if "kpi" in sources:
        availability.append(_kpi_has_data(context.get("kpis") or {}))
    if "alerts" in sources:
        availability.append(bool(context.get("alerts")))
    if "forecast" in sources:
        availability.append(bool(context.get("forecast")))
    if "recommendations" in sources:
        availability.append(bool(context.get("recommendations")))

    if availability and all(availability):
        return "high"
    if any(availability):
        return "medium"
    return "low"


def generate_dataset_reply(
    message: str, context: dict[str, Any] | None, user_role: str
) -> tuple[str, str | None]:
    if not settings.gemini_api_key:
        return (
            "Gemini API key is not configured. Set GEMINI_API_KEY in the server .env file.",
            None,
        )

    system_prompt = _build_system_prompt(context, user_role)
    try:
        model_name = settings.gemini_model or "gemini-1.5-flash"
        generation_config = {
            "temperature": 0.3,
            "topP": 0.2,
            "maxOutputTokens": 350,
        }
        response_text, model_used = _generate_via_rest(
            model_name, system_prompt, message, generation_config
        )
        return response_text, model_used
    except Exception:
        return (
            "Gemini model is unavailable. Verify GEMINI_API_KEY and GEMINI_MODEL in the server .env file.",
            None,
        )


def build_chat_log(message: str, response: str, context: dict[str, Any] | None, user_id: str | None) -> dict:
    return {
        "user_id": user_id,
        "message": message,
        "response": response,
        "context": context,
        "created_at": datetime.now(timezone.utc),
    }
