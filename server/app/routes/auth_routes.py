from __future__ import annotations

from datetime import datetime, timedelta, timezone
import hashlib

from fastapi import APIRouter, Depends, HTTPException, status
from jose import jwt
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.config import settings
from app.db.mongodb import get_db
from app.models.schemas import Token, UserCreate, UserLogin, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

# ---------------------------------
# Password Hashing (ARGON2)
# ---------------------------------
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)


def _hash_password(password: str) -> str:
    """
    Secure password hashing:
    - SHA-256 normalization
    - Argon2 (no length limit, Windows-safe)
    """
    normalized = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return pwd_context.hash(normalized)


def _verify_password(plain_password: str, hashed_password: str) -> bool:
    normalized = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
    return pwd_context.verify(normalized, hashed_password)


# ---------------------------------
# JWT
# ---------------------------------
def _create_access_token(subject: str) -> tuple[str, int]:
    expires_delta = timedelta(minutes=settings.jwt_expire_minutes)
    expire = datetime.now(timezone.utc) + expires_delta

    payload = {
        "sub": subject,
        "exp": expire,
    }

    token = jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )

    return token, int(expires_delta.total_seconds())


# ---------------------------------
# Register
# ---------------------------------
@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    user: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> UserOut:
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    role_value = (user.role or "OPERATOR").upper()
    payload = {
        "email": user.email,
        "full_name": user.full_name,
        "role": role_value,
        "hashed_password": _hash_password(user.password),
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.users.insert_one(payload)

    return UserOut(
        id=str(result.inserted_id),
        email=user.email,
        full_name=user.full_name,
        role=role_value,
        created_at=payload["created_at"],
    )


# ---------------------------------
# Login
# ---------------------------------
@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> Token:
    user = await db.users.find_one({"email": credentials.email})

    if not user or not _verify_password(
        credentials.password,
        user.get("hashed_password", ""),
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token, expires_in = _create_access_token(
        subject=str(user["_id"])
    )

    return Token(
        access_token=token,
        expires_in=expires_in,
        role=user.get("role") or "OPERATOR",
        user={
            "email": user.get("email"),
            "name": user.get("full_name") or user.get("email", "").split("@")[0],
            "role": user.get("role") or "OPERATOR",
        },
    )
