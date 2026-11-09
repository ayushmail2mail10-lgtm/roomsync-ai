import hashlib
import os
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from ..config import settings
from ..database import get_db
from ..models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token", auto_error=False)

def get_password_hash(password: str) -> str:
    """Returns secure salted SHA-256 hash."""
    salt = "roomsync_ind_salt_2026"
    return hashlib.sha256((salt + password).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain password against stored salted hash."""
    return get_password_hash(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Query current user and active role directly from database
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")
    return user

def require_role(allowed_roles: List[str]):
    """
    Enforces backend role-based access control against the database role.
    Admins are always permitted.
    """
    def role_checker(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
        db_user = db.query(User).filter(User.id == current_user.id).first()
        if not db_user or (db_user.role not in allowed_roles and db_user.role != "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {allowed_roles} roles. Your role is '{getattr(db_user, 'role', 'unknown')}'."
            )
        return db_user
    return role_checker

def require_admin(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
    """
    Strict backend authorization for administrator access only.
    Always verifies actual database role, never trusting unverified claims.
    """
    db_user = db.query(User).filter(User.id == current_user.id).first()
    if not db_user or db_user.role != "admin" or not db_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Authorized Administrator privileges required."
        )
    return db_user
