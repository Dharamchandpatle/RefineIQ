from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.models.schemas import ForecastRecord
from app.db.mongodb import get_db
from app.services.forecast_service import get_forecast_from_db, load_forecast

router = APIRouter(prefix="/forecasts", tags=["forecasts"])
router_api = APIRouter(prefix="/api", tags=["forecasts"])


@router.get("", response_model=list[ForecastRecord])
async def get_forecasts(
    forecast_type: str = Query("energy", pattern="^(energy|sec)$"),
    limit: int = Query(100, ge=1, le=2000),
) -> list[ForecastRecord]:
    if forecast_type == "sec":
        return load_forecast("sec_forecast.csv", "sec", limit)
    return load_forecast("energy_forecast.csv", "energy", limit)


@router_api.get("/forecast", response_model=list[ForecastRecord])
async def api_forecast(
    metric: str = Query("energy", pattern="^(energy|sec)$"),
    limit: int = Query(100, ge=1, le=2000),
    db=Depends(get_db),
) -> list[ForecastRecord]:
    return await get_forecast_from_db(db, metric, limit)
