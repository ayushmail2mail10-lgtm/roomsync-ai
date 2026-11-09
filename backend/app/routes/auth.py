from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.profile import Profile
from ..models.verification import Verification
from ..schemas.user import UserCreate, UserLogin, UserOut, Token
from ..services.auth_utils import verify_password, get_password_hash, create_access_token, get_current_user
from ..config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

ALLOWED_PUBLIC_ROLES = {"tenant", "property_owner", "flat_owner"}

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
    
    # Security: Strictly restrict public self-registration roles
    # Never allow public registration as 'admin'
    requested_role = (user_in.role or "tenant").lower().strip()
    if requested_role not in ALLOWED_PUBLIC_ROLES:
        requested_role = "tenant"

    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        role=requested_role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize empty profile & basic verification
    profile = Profile(
        user_id=new_user.id,
        bio=f"Hey, I'm {new_user.full_name}. Registered as a {requested_role.replace('_', ' ').title()} on RoomSync AI.",
        upi_id=f"{new_user.email.split('@')[0]}@okaxis",
        housing_status="Need Flat & Roommate" if requested_role == "tenant" else "Has Flat / Has Room"
    )
    db.add(profile)

    verification = Verification(
        user_id=new_user.id,
        trust_score=50,
        phone_verified=True
    )
    db.add(verification)
    db.commit()

    access_token = create_access_token(
        data={"sub": new_user.email, "id": new_user.id, "role": new_user.role},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": new_user.id,
        "full_name": new_user.full_name,
        "email": new_user.email,
        "role": new_user.role
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )
    
    access_token = create_access_token(
        data={"sub": user.email, "id": user.id, "role": user.role},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
