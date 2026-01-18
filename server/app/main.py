from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.mongodb import close_mongo_connection, connect_to_mongo
from app.routes.anomaly_routes import router as anomaly_router
from app.routes.auth_routes import router as auth_router
from app.routes.chatbot_routes import router as chatbot_router
from app.routes.forecast_routes import router as forecast_router
from app.routes.kpi_routes import router as kpi_router
from app.routes.recommendation_routes import router as recommendation_router
from app.routes.upload_routes import router as upload_router

app = FastAPI(title="RefineryIQ API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.client_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup() -> None:
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown() -> None:
    await close_mongo_connection()


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(kpi_router)
app.include_router(anomaly_router)
app.include_router(forecast_router)
app.include_router(recommendation_router)
app.include_router(chatbot_router)
app.include_router(upload_router)
