from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.profile import Profile
from ..models.verification import Verification
from ..schemas.match import RoommateMatchOut, CompatibilityBreakdown
from ..services.matching_engine import calculate_compatibility
from ..services.auth_utils import get_current_user

router = APIRouter(prefix="/matches", tags=["Roommate Matching"])

@router.get("/explore", response_model=List[RoommateMatchOut])
def explore_roommates(
    city: Optional[str] = Query(None),
    neighborhood: Optional[str] = Query(None),
    max_budget: Optional[int] = Query(None),
    dietary_pref: Optional[str] = Query(None),
    smoking: Optional[str] = Query(None),
    sleep_schedule: Optional[str] = Query(None),
    min_cleanliness: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve current user's profile
    my_profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not my_profile:
        my_profile = Profile(user_id=current_user.id)
        db.add(my_profile)
        db.commit()
        db.refresh(my_profile)

    # Query all potential flatmates except current user
    query = db.query(User).filter(User.id != current_user.id, User.is_active == True)
    candidates = query.all()

    matches = []
    for candidate in candidates:
        c_profile = candidate.profile
        if not c_profile:
            continue

        # Filter criteria
        if city and c_profile.city and city.lower() not in c_profile.city.lower():
            continue
        if neighborhood and c_profile.neighborhood and neighborhood.lower() not in c_profile.neighborhood.lower():
            continue
        if max_budget and c_profile.budget_min and c_profile.budget_min > max_budget:
            continue
        if dietary_pref and c_profile.dietary_pref and dietary_pref.lower() not in c_profile.dietary_pref.lower():
            continue
        if smoking and c_profile.smoking and smoking.lower() not in c_profile.smoking.lower():
            continue
        if sleep_schedule and c_profile.sleep_schedule and sleep_schedule.lower() not in c_profile.sleep_schedule.lower():
            continue
        if min_cleanliness and c_profile.cleanliness and c_profile.cleanliness < min_cleanliness:
            continue

        # AI compatibility evaluation
        comp = calculate_compatibility(my_profile, c_profile)

        verification_data = None
        if candidate.verification:
            verification_data = candidate.verification

        matches.append(
            RoommateMatchOut(
                user_id=candidate.id,
                full_name=candidate.full_name,
                email=candidate.email,
                phone=candidate.phone,
                profile=c_profile,
                verification=verification_data,
                compatibility=CompatibilityBreakdown(**comp)
            )
        )

    # Sort candidates by overall compatibility score descending
    matches.sort(key=lambda m: m.compatibility.overall_score, reverse=True)
    return matches

@router.get("/{target_user_id}/compatibility", response_model=CompatibilityBreakdown)
def get_match_breakdown(
    target_user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    my_profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    target_profile = db.query(Profile).filter(Profile.user_id == target_user_id).first()

    if not target_profile:
        raise HTTPException(status_code=404, detail="Target user profile not found")

    comp = calculate_compatibility(my_profile, target_profile)
    return CompatibilityBreakdown(**comp)
