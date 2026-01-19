from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.mongodb import get_db
from app.services.auth_service import require_admin
from app.services.pipeline_service import run_pipeline, save_uploaded_file
from app.services.dataset_service import create_dataset_record

router = APIRouter(prefix="/api", tags=["dataset"])


@router.post("/upload-dataset")
async def upload_dataset(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
    _user=Depends(require_admin),
) -> dict[str, str]:
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing file name")

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only CSV files are supported")

    try:
        file_bytes = await file.read()
        saved_path = save_uploaded_file(file_bytes, file.filename)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save file") from exc

    try:
        dataset = await create_dataset_record(db, file.filename)
        await run_pipeline(Path(saved_path), db, dataset_id=dataset["id"])
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:
        print("PIPELINE ERROR:", str(exc))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return {
        "status": "Dataset uploaded and AI analysis completed",
        "dataset_id": dataset["id"],
    }
