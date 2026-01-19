from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.models.schemas import Alert, AnomalyRecord
from app.db.mongodb import get_db
from app.services.anomaly_service import build_alerts, get_alerts_from_db, load_anomalies

router = APIRouter(prefix="/anomalies", tags=["anomalies"])
router_api = APIRouter(prefix="/api", tags=["anomalies"])


@router.get("", response_model=list[AnomalyRecord])
async def get_anomalies(limit: int = Query(100, ge=1, le=1000)) -> list[AnomalyRecord]:
    return load_anomalies(limit)


@router.get("/alerts", response_model=list[Alert])
async def get_alerts(limit: int = Query(100, ge=1, le=1000)) -> list[Alert]:
    return build_alerts(limit)


@router_api.get("/anomalies", response_model=list[Alert])
async def api_alerts(
    limit: int = Query(100, ge=1, le=1000),
    db=Depends(get_db),
) -> list[Alert]:
    return await get_alerts_from_db(db, limit)


@router_api.get("/alerts")
async def api_alerts_latest(
    dataset_id: str | None = Query(default=None),
    limit: int = Query(15, ge=1, le=100),
    db=Depends(get_db),
) -> list[dict]:
    alerts = await get_alerts_from_db(db, limit, dataset_id=dataset_id)
    return [
        {
            "severity": alert.get("severity"),
            "message": alert.get("message"),
            "unit": alert.get("source") or alert.get("unit_name"),
            "timestamp": alert.get("timestamp") or alert.get("date"),
        }
        for alert in (alerts or [])
    ]
