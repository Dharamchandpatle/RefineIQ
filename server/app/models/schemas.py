from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    role: str = "OPERATOR"


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(UserBase):
    id: str | None = None
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    role: str | None = None
    user: dict[str, Any] | None = None


class KPISummary(BaseModel):
    total_energy: float | None = None
    avg_energy: float | None = None
    avg_sec: float | None = None
    anomaly_rate: float | None = None
    total_records: int | None = None
    total_anomalies: int | None = None
    high_severity_count: int | None = None
    predicted_energy_next_day: float | None = None
    last_updated: datetime


class KPISnapshot(KPISummary):
    id: str | None = None


class Alert(BaseModel):
    id: str | None = None
    message: str
    severity: str
    timestamp: datetime | None = None
    source: str | None = None


class ForecastRecord(BaseModel):
    timestamp: str | None = None
    value: float | None = None
    metric: str | None = None
    raw: dict[str, Any]


class Recommendation(BaseModel):
    id: str | None = None
    title: str
    description: str | None = None
    impact: str | None = None
    timestamp: datetime | None = None


class AnomalyRecord(BaseModel):
    timestamp: str | None = None
    score: float | None = None
    raw: dict[str, Any]


class ChatbotRequest(BaseModel):
    message: str = Field(min_length=1)
    context: dict[str, Any] | None = None
    user_id: str | None = None


class ChatbotResponse(BaseModel):
    reply: str
    created_at: datetime
    model: str | None = None


class ChatbotLog(BaseModel):
    user_id: str | None = None
    message: str
    response: str
    created_at: datetime
    context: dict[str, Any] | None = None
