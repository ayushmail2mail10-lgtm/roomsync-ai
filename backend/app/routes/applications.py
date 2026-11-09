import json
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.profile import Profile
from ..models.verification import Verification
from ..models.property import PropertyListing, RoomListing, PropertyApplication
from ..schemas.property import (
    ApplicationCreate, ApplicationDecision, PropertyApplicationOut, ApplicantSummary
)
from ..services.auth_utils import get_current_user, require_role
from ..services.matching_engine import calculate_compatibility

router = APIRouter(prefix="/applications", tags=["Property Applications"])


def _format_application_out(app: PropertyApplication, db: Session) -> PropertyApplicationOut:
    prop = app.property
    room = app.room
    applicant = app.applicant
    owner = app.owner

    applicant_profile = db.query(Profile).filter(Profile.user_id == applicant.id).first() if applicant else None
    applicant_verif = db.query(Verification).filter(Verification.user_id == applicant.id).first() if applicant else None
    owner_profile = db.query(Profile).filter(Profile.user_id == owner.id).first() if owner else None

    # Calculate live AI compatibility between applicant profile and owner profile (or default to 90)
    comp_score = 88
    if applicant_profile and owner_profile:
        try:
            comp = calculate_compatibility(owner_profile, applicant_profile)
            comp_score = comp.get("overall_score", 88)
        except Exception:
            comp_score = 88

    applicant_summary = ApplicantSummary(
        id=applicant.id,
        name=applicant.full_name,
        email=applicant.email,
        avatar_url=applicant_profile.avatar_url if applicant_profile else None,
        occupation=applicant_profile.occupation if applicant_profile else None,
        company=applicant_profile.company if applicant_profile else None,
        trust_score=applicant_verif.trust_score if applicant_verif else 80,
        compatibility_score=comp_score
    )

    # First image of property
    first_image = None
    if prop and prop.image_urls:
        try:
            imgs = json.loads(prop.image_urls) if isinstance(prop.image_urls, str) else prop.image_urls
            if imgs and len(imgs) > 0:
                first_image = imgs[0]
        except Exception:
            pass

    return PropertyApplicationOut(
        id=app.id,
        property_id=app.property_id,
        property_title=prop.title if prop else "Unknown Property",
        property_city=prop.city if prop else "",
        property_neighborhood=prop.neighborhood if prop else "",
        property_monthly_rent=prop.monthly_rent if prop else 0,
        property_image=first_image,
        room_id=app.room_id,
        room_title=room.title if room else None,
        room_rent=room.rent if room else None,
        applicant_id=app.applicant_id,
        applicant=applicant_summary,
        owner_id=app.owner_id,
        owner_name=owner.full_name if owner else "Owner",
        status=app.status,
        message=app.message,
        move_in_date=app.move_in_date,
        proposed_budget=app.proposed_budget,
        created_at=app.created_at,
        updated_at=app.updated_at
    )


@router.post("/properties/{property_id}/apply", response_model=PropertyApplicationOut, status_code=status.HTTP_201_CREATED)
def apply_for_property(
    property_id: int,
    app_in: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit an application for a property or specific vacant room.
    Enforces business rules:
    - Cannot apply to own property.
    - Prevents duplicate active applications.
    - Prevents applying to unavailable or occupied rooms.
    """
    prop = db.query(PropertyListing).filter(PropertyListing.id == property_id).first()
    if not prop or prop.status == "archived":
        raise HTTPException(status_code=404, detail="Property listing not found or has been archived")

    if prop.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot apply to your own property listing")

    # If applying to a specific room, validate room
    room = None
    if app_in.room_id:
        room = db.query(RoomListing).filter(RoomListing.id == app_in.room_id, RoomListing.property_id == prop.id).first()
        if not room:
            raise HTTPException(status_code=404, detail="Specified room not found in this property")
        if not room.is_vacant:
            raise HTTPException(status_code=400, detail="Cannot apply: This room is already occupied or unavailable")

    # Check for duplicate active applications by this tenant
    duplicate_query = db.query(PropertyApplication).filter(
        PropertyApplication.property_id == prop.id,
        PropertyApplication.applicant_id == current_user.id,
        PropertyApplication.status.in_(["pending", "shortlisted", "accepted"])
    )
    if app_in.room_id:
        duplicate_query = duplicate_query.filter(PropertyApplication.room_id == app_in.room_id)

    if duplicate_query.first():
        raise HTTPException(
            status_code=400,
            detail="You already have an active application submitted for this property/room"
        )

    # Check if property has any available bedrooms
    if prop.available_bedrooms <= 0 and not room:
        raise HTTPException(
            status_code=400,
            detail="Cannot apply: Property currently has no available bedrooms"
        )

    new_app = PropertyApplication(
        property_id=prop.id,
        room_id=room.id if room else None,
        applicant_id=current_user.id,
        owner_id=prop.owner_id,
        status="pending",
        message=app_in.message.strip() if app_in.message else None,
        move_in_date=app_in.move_in_date.strip() if app_in.move_in_date else None,
        proposed_budget=app_in.proposed_budget,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    return _format_application_out(new_app, db)


@router.get("/my-applications", response_model=List[PropertyApplicationOut])
def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns only the applications submitted by the current authenticated user.
    Strict tenant privacy isolation.
    """
    apps = (
        db.query(PropertyApplication)
        .filter(PropertyApplication.applicant_id == current_user.id)
        .order_by(PropertyApplication.created_at.desc())
        .all()
    )
    return [_format_application_out(a, db) for a in apps]


@router.get("/incoming", response_model=List[PropertyApplicationOut])
def get_incoming_applications(
    property_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(require_role(["property_owner", "flat_owner", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Returns applications received for properties owned by current user (or all if admin).
    Strict landlord/owner isolation.
    """
    query = db.query(PropertyApplication)
    
    if current_user.role != "admin":
        query = query.filter(PropertyApplication.owner_id == current_user.id)

    if property_id:
        query = query.filter(PropertyApplication.property_id == property_id)
    if status_filter and status_filter.strip():
        query = query.filter(PropertyApplication.status == status_filter.strip())

    apps = query.order_by(PropertyApplication.created_at.desc()).all()
    return [_format_application_out(a, db) for a in apps]


@router.post("/{application_id}/decision", response_model=PropertyApplicationOut)
def decide_application(
    application_id: int,
    decision_in: ApplicationDecision,
    current_user: User = Depends(require_role(["property_owner", "flat_owner", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Accept, shortlist, or reject an application.
    Enforces ownership and availability rules:
    - Only the listing owner or admin can make decisions.
    - Prevents accepting conflicting applications when room/property is full.
    - Automatically updates room vacancy and available bedrooms on acceptance.
    """
    app = db.query(PropertyApplication).filter(PropertyApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Ownership check
    if app.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only make decisions on applications for your own listings"
        )

    target_decision = decision_in.decision

    if target_decision == "accepted":
        prop = app.property
        # Check property bedroom capacity
        if prop.available_bedrooms <= 0:
            raise HTTPException(
                status_code=400,
                detail="Conflict: Cannot accept application because this property has no remaining available bedrooms"
            )

        # Check room vacancy if specific room applied for
        if app.room_id and app.room:
            if not app.room.is_vacant:
                raise HTTPException(
                    status_code=400,
                    detail="Conflict: Cannot accept application because this specific room is already occupied"
                )
            # Mark room occupied
            app.room.is_vacant = False

        # Decrement available bedrooms in property
        prop.available_bedrooms = max(0, prop.available_bedrooms - 1)
        if prop.available_bedrooms == 0:
            prop.status = "occupied"

        # Auto-reject other pending applications for the same specific room to prevent conflicts
        if app.room_id:
            conflicting_apps = db.query(PropertyApplication).filter(
                PropertyApplication.property_id == prop.id,
                PropertyApplication.room_id == app.room_id,
                PropertyApplication.id != app.id,
                PropertyApplication.status == "pending"
            ).all()
            for c_app in conflicting_apps:
                c_app.status = "rejected"
                c_app.updated_at = datetime.utcnow()

    app.status = target_decision
    app.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(app)

    return _format_application_out(app, db)
