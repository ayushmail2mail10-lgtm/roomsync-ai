from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.profile import Profile
from ..models.verification import Verification
from ..schemas.profile import ProfileOut, ProfileUpdate
from ..schemas.verification import VerificationOut
from ..services.auth_utils import get_current_user

router = APIRouter(prefix="/profiles", tags=["Profiles"])

@router.get("/me", response_model=ProfileOut)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("/me", response_model=ProfileOut)
def update_my_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    update_data = profile_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/{user_id}")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    verification = db.query(Verification).filter(Verification.user_id == user_id).first()

    return {
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "profile": profile,
        "verification": verification
    }
