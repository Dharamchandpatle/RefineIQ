from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.db.mongodb import get_db
from app.models.schemas import ChatbotRequest, ChatbotResponse, ChatbotQueryRequest, ChatbotQueryResponse
from app.services.chatbot_service import (
    build_chat_log,
    build_chat_context,
    generate_dataset_reply,
    generate_reply,
    _calculate_confidence,
    _validate_dataset,
)
from app.services.kpi_service import get_latest_snapshot
from app.services.anomaly_service import get_alerts_from_db
from app.services.recommendation_service import get_recommendations_from_db

router = APIRouter(prefix="/chatbot", tags=["chatbot"])
router_api = APIRouter(prefix="/api", tags=["chatbot"])


@router.post("", response_model=ChatbotResponse)
async def chatbot(request: ChatbotRequest, db=Depends(get_db)) -> ChatbotResponse:
    context = request.context or {}
    context.update(
        {
            "kpis": await get_latest_snapshot(db),
            "alerts": await get_alerts_from_db(db, 10),
            "recommendations": await get_recommendations_from_db(db, 5),
        }
    )
    reply, model_name = generate_reply(request.message, context)
    created_at = datetime.now(timezone.utc)

    if db is not None:
        await db.chatbot_logs.insert_one(
            build_chat_log(request.message, reply, context, request.user_id)
        )

    return ChatbotResponse(reply=reply, created_at=created_at, model=model_name)


@router_api.post("/chatbot", response_model=ChatbotResponse)
async def chatbot_api(request: ChatbotRequest, db=Depends(get_db)) -> ChatbotResponse:
    return await chatbot(request, db)


@router_api.post("/chatbot/query", response_model=ChatbotQueryResponse)
async def chatbot_query(request: ChatbotQueryRequest, db=Depends(get_db)) -> ChatbotQueryResponse:
    if db is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database unavailable")

    role = request.user_role.lower()
    if role not in {"admin", "operator"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user role")

    try:
        await _validate_dataset(db, request.dataset_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    context, sources = await build_chat_context(db, request.dataset_id, request.question)
    confidence = _calculate_confidence(sources, context)

    if confidence == "low":
        return ChatbotQueryResponse(
            answer="Data not available for selected dataset",
            sources=sources,
            confidence=confidence,
        )

    reply, _ = generate_dataset_reply(request.question, context, role)
    return ChatbotQueryResponse(answer=reply, sources=sources, confidence=confidence)
