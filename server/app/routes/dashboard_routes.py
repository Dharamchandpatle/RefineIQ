from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.db.mongodb import get_db
from app.services.dashboard_service import get_admin_dashboard, get_operator_dashboard

router_api = APIRouter(prefix="/api", tags=["dashboard"])


@router_api.get("/dashboard/operator")
async def api_operator_dashboard(
    dataset_id: str | None = Query(default=None),
    db=Depends(get_db),
) -> dict:
    return await get_operator_dashboard(db, dataset_id)


@router_api.get("/dashboard/admin")
async def api_admin_dashboard(
    dataset_id: str | None = Query(default=None),
    db=Depends(get_db),
) -> dict:
    return await get_admin_dashboard(db, dataset_id)
