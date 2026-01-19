from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.db.mongodb import get_db
from app.models.schemas import ChatbotRequest, ChatbotResponse
from app.services.chatbot_service import build_chat_log, generate_reply
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
