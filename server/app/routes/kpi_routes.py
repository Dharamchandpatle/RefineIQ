from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.db.mongodb import get_db
from app.models.schemas import KPISnapshot, KPISummary
from app.services.kpi_service import get_latest_snapshot, list_snapshots

router = APIRouter(prefix="/kpis", tags=["kpis"])
router_api = APIRouter(prefix="/api", tags=["kpis"])


@router.get("/summary", response_model=KPISummary)
async def kpi_summary(db=Depends(get_db)) -> KPISummary:
    return await get_latest_snapshot(db)


@router_api.get("/kpis", response_model=KPISummary)
async def api_kpi_summary(db=Depends(get_db)) -> KPISummary:
    return await get_latest_snapshot(db)


@router.get("/snapshots", response_model=list[KPISnapshot])
async def kpi_snapshots(
    limit: int = Query(50, ge=1, le=500),
    db=Depends(get_db),
) -> list[KPISnapshot]:
    return await list_snapshots(db, limit)
