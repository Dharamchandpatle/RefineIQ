from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[1]
DEFAULT_DATA_DIR = BASE_DIR / "data"


class Settings(BaseSettings):
    env: str = "development"
    fastapi_port: int = 8000
    mongo_uri: str
    mongo_db: str = "refineryIQ"
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    client_url: str = "http://localhost:5173"
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-1.5-flash"
    data_dir: str = str(DEFAULT_DATA_DIR)

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()
