import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET") or "drishti-setu-secure-jwt-key-2026-gujarat-police"
FALLBACK_SECRET = "drishti-setu-secure-jwt-key-2026-gujarat-police"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 Days for robust hackathon session persistence

# Swagger UI integration
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="login", auto_error=False)


def decode_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes JWT token with primary SECRET_KEY and secondary fallback secret.
    Returns decoded payload dict or None.
    """
    if not token:
        return None
    # Attempt primary key
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        pass

    # Attempt fallback key if different
    if SECRET_KEY != FALLBACK_SECRET:
        try:
            return jwt.decode(token, FALLBACK_SECRET, algorithms=[ALGORITHM])
        except Exception:
            pass

    return None


def get_optional_current_user(token: Optional[str] = Depends(oauth2_scheme_optional)) -> Optional[str]:
    """Returns employee_id if valid Bearer token provided, otherwise None without raising 401."""
    if not token:
        return None
    payload = decode_jwt_token(token)
    if payload:
        return payload.get("sub")
    return None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Safely verifies plain password against bcrypt hash, with plain text fallback."""
    if not plain_password or not hashed_password:
        return False
    # Direct match check (for mock/unhashed passwords in demo environments)
    if plain_password == hashed_password:
        return True
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    now_utc = datetime.now(timezone.utc)
    if expires_delta:
        expire = now_utc + expires_delta
    else:
        expire = now_utc + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_jwt_token(token)
    if not payload:
        raise credentials_exception
    employee_id: Optional[str] = payload.get("sub")
    if not employee_id:
        raise credentials_exception
    return employee_id


def get_current_admin_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_jwt_token(token)
    if not payload:
        raise credentials_exception
    employee_id: Optional[str] = payload.get("sub")
    if not employee_id:
        raise credentials_exception

    role: str = payload.get("role", "")
    if role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privilege required for this action"
        )
    return {
        "employee_id": employee_id,
        "id": payload.get("id"),
        "role": role
    }

