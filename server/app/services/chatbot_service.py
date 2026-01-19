from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import requests

from app.config import settings


def _build_system_prompt(context: dict[str, Any] | None) -> str:
    context = context or {}
    kpis = context.get("kpis") or {}
    alerts = context.get("alerts") or []
    recommendations = context.get("recommendations") or []

    return (
        "You are a refinery operations assistant. Explain KPIs, alerts, forecasts, and "
        "recommendations clearly for engineers and leadership."
        f"\nKPIs: {kpis}"
        f"\nAlerts: {alerts}"
        f"\nRecommendations: {recommendations}"
        "\nKeep responses concise, actionable, and data-driven."
    )


def _generate_via_rest(model_name: str, system_prompt: str, message: str) -> tuple[str, str]:
    normalized = model_name.replace("models/", "").strip()
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{normalized}:generateContent"
    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": system_prompt}]},
            {"role": "user", "parts": [{"text": message}]},
        ]
    }
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


def build_chat_log(message: str, response: str, context: dict[str, Any] | None, user_id: str | None) -> dict:
    return {
        "user_id": user_id,
        "message": message,
        "response": response,
        "context": context,
        "created_at": datetime.now(timezone.utc),
    }
