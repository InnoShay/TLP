import os
import uuid
import secrets
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import jwt

from database import get_session, User, ApiKey, ApiLog
from models import UserSignup, UserLogin, TokenResponse, ApiKeyResponse, ApiLogResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

SECRET_KEY = os.environ.get("JWT_SECRET", "supersecret-dev-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

import bcrypt

def verify_password(plain_password: str, hashed_password: str):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_session)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user


@router.post("/signup", response_model=TokenResponse)
async def signup(user: UserSignup, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.email == user.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    new_user = User(
        id=str(uuid.uuid4()),
        email=user.email,
        password_hash=get_password_hash(user.password)
    )
    session.add(new_user)
    await session.commit()
    
    access_token = create_access_token(data={"sub": new_user.id}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": user.id}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}


# ── API Keys Management ──

@router.get("/keys", response_model=List[ApiKeyResponse])
async def get_api_keys(current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(ApiKey).where(ApiKey.user_id == current_user.id).order_by(ApiKey.created_at.desc()))
    keys = result.scalars().all()
    
    response = []
    for k in keys:
        # Count usage
        count_res = await session.execute(select(ApiLog).where(ApiLog.api_key_id == k.id))
        usage = len(count_res.scalars().all())
        response.append({
            "id": k.id,
            "name": k.name,
            "key": k.key,
            "created_at": k.created_at,
            "usage": usage
        })
    return response

@router.post("/keys", response_model=ApiKeyResponse)
async def create_api_key(name: str, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    raw_key = "sk_live_" + secrets.token_urlsafe(24)
    new_key = ApiKey(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        key=raw_key,
        name=name
    )
    session.add(new_key)
    await session.commit()
    
    return {
        "id": new_key.id,
        "name": new_key.name,
        "key": new_key.key,
        "created_at": new_key.created_at,
        "usage": 0
    }

@router.delete("/keys/{key_id}")
async def delete_api_key(key_id: str, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == current_user.id))
    key = result.scalar_one_or_none()
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")
        
    # delete logs first (foreign key)
    logs_res = await session.execute(select(ApiLog).where(ApiLog.api_key_id == key_id))
    for log in logs_res.scalars().all():
        await session.delete(log)
        
    await session.delete(key)
    await session.commit()
    return {"success": True}

@router.post("/keys/{key_id}/regenerate", response_model=ApiKeyResponse)
async def regenerate_api_key(key_id: str, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == current_user.id))
    key = result.scalar_one_or_none()
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")
        
    key.key = "sk_live_" + secrets.token_urlsafe(24)
    await session.commit()
    
    # Count usage
    count_res = await session.execute(select(ApiLog).where(ApiLog.api_key_id == key.id))
    usage = len(count_res.scalars().all())
    
    return {
        "id": key.id,
        "name": key.name,
        "key": key.key,
        "created_at": key.created_at,
        "usage": usage
    }

@router.get("/logs", response_model=List[ApiLogResponse])
async def get_logs(current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    # Get all user keys
    keys_res = await session.execute(select(ApiKey).where(ApiKey.user_id == current_user.id))
    key_ids = [k.id for k in keys_res.scalars().all()]
    
    if not key_ids:
        return []
        
    logs_res = await session.execute(
        select(ApiLog)
        .where(ApiLog.api_key_id.in_(key_ids))
        .order_by(ApiLog.created_at.desc())
        .limit(50)
    )
    
    logs = logs_res.scalars().all()
    return [{
        "timestamp": l.created_at,
        "claim": l.request_payload or "",
        "status": l.response_status or "Unknown",
        "score": l.score or 0.0,
        "latency": l.latency
    } for l in logs]
