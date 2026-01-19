from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.db.mongodb import get_db
from app.services.dataset_service import get_active_dataset_id, list_datasets, set_active_dataset

router_api = APIRouter(prefix="/api", tags=["datasets"])


@router_api.get("/datasets")
async def api_list_datasets(db=Depends(get_db)) -> list[dict]:
    return await list_datasets(db)


@router_api.get("/datasets/active")
async def api_get_active_dataset(db=Depends(get_db)) -> dict:
    dataset_id = await get_active_dataset_id(db)
    return {"dataset_id": dataset_id}


@router_api.post("/datasets/active/{dataset_id}")
async def api_set_active_dataset(
    dataset_id: str,
    db=Depends(get_db),
) -> dict:
    if not dataset_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing dataset id")
    await set_active_dataset(db, dataset_id)
    return {"dataset_id": dataset_id}