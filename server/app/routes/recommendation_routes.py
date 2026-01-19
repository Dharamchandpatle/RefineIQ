from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.models.schemas import Recommendation
from app.db.mongodb import get_db
from app.services.recommendation_service import get_recommendations_from_db, load_recommendations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])
router_api = APIRouter(prefix="/api", tags=["recommendations"])


@router.get("", response_model=list[Recommendation])
async def get_recommendations(limit: int = Query(50, ge=1, le=500)) -> list[Recommendation]:
    return load_recommendations(limit)


@router_api.get("/recommendations", response_model=list[Recommendation])
async def api_recommendations(
    limit: int = Query(50, ge=1, le=500),
    db=Depends(get_db),
) -> list[Recommendation]:
    return await get_recommendations_from_db(db, limit)
