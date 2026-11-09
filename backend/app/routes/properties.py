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
    PropertyCreate, PropertyUpdate, PropertyOut, RoomCreate, RoomOut, OwnerSummary
)
from ..services.auth_utils import get_current_user, require_role

router = APIRouter(prefix="/properties", tags=["Property & Room Discovery"])


def _format_property_out(p: PropertyListing, db: Session) -> PropertyOut:
    """Helper to convert ORM PropertyListing to PropertyOut schema with owner details and parsed JSON."""
    owner = db.query(User).filter(User.id == p.owner_id).first()
    owner_profile = db.query(Profile).filter(Profile.user_id == p.owner_id).first() if owner else None
    owner_verif = db.query(Verification).filter(Verification.user_id == p.owner_id).first() if owner else None
    
    owner_summary = None
    if owner:
        owner_summary = OwnerSummary(
            id=owner.id,
            name=owner.full_name,
            email=owner.email,
            avatar_url=owner_profile.avatar_url if owner_profile else None,
            trust_score=owner_verif.trust_score if owner_verif else 80,
            verified=bool(owner_verif and (owner_verif.aadhaar_verified or owner_verif.work_email_verified))
        )

    # Parse JSON fields safely
    def _parse_json(val):
        if not val:
            return []
        if isinstance(val, list):
            return val
        try:
            return json.loads(val)
        except Exception:
            return []

    rooms_out = []
    for r in p.rooms:
        rooms_out.append(RoomOut(
            id=r.id,
            property_id=r.property_id,
            title=r.title,
            room_type=r.room_type,
            rent=r.rent,
            deposit=r.deposit,
            is_vacant=r.is_vacant,
            available_from=r.available_from,
            furnishing=r.furnishing,
            amenities=_parse_json(r.amenities),
            created_at=r.created_at
        ))

    apps_count = db.query(PropertyApplication).filter(PropertyApplication.property_id == p.id).count()

    return PropertyOut(
        id=p.id,
        owner_id=p.owner_id,
        owner=owner_summary,
        title=p.title,
        description=p.description,
        city=p.city,
        neighborhood=p.neighborhood,
        address=p.address,
        property_type=p.property_type,
        total_bedrooms=p.total_bedrooms,
        available_bedrooms=p.available_bedrooms,
        monthly_rent=p.monthly_rent,
        deposit_amount=p.deposit_amount,
        furnishing_status=p.furnishing_status,
        amenities=_parse_json(p.amenities),
        image_urls=_parse_json(p.image_urls),
        preferred_gender=p.preferred_gender,
        food_preference=p.food_preference,
        rules=_parse_json(p.rules),
        status=p.status,
        rooms=rooms_out,
        applications_count=apps_count,
        created_at=p.created_at,
        updated_at=p.updated_at
    )


@router.get("", response_model=List[PropertyOut])
def list_properties(
    city: Optional[str] = Query(None),
    neighborhood: Optional[str] = Query(None),
    min_rent: Optional[int] = Query(None),
    max_rent: Optional[int] = Query(None),
    furnishing: Optional[str] = Query(None),
    property_type: Optional[str] = Query(None),
    preferred_gender: Optional[str] = Query(None),
    vacant_only: Optional[bool] = Query(False),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Public / Tenant Property and Vacant Room Search.
    Filters out archived properties.
    """
    query = db.query(PropertyListing).filter(PropertyListing.status != "archived")

    if city and city.strip():
        query = query.filter(PropertyListing.city.ilike(f"%{city.strip()}%"))
    if neighborhood and neighborhood.strip():
        query = query.filter(PropertyListing.neighborhood.ilike(f"%{neighborhood.strip()}%"))
    if min_rent is not None:
        query = query.filter(PropertyListing.monthly_rent >= min_rent)
    if max_rent is not None:
        query = query.filter(PropertyListing.monthly_rent <= max_rent)
    if furnishing and furnishing.strip():
        query = query.filter(PropertyListing.furnishing_status == furnishing.strip())
    if property_type and property_type.strip():
        query = query.filter(PropertyListing.property_type.ilike(f"%{property_type.strip()}%"))
    if preferred_gender and preferred_gender.strip() and preferred_gender != "Any":
        query = query.filter(PropertyListing.preferred_gender.in_([preferred_gender.strip(), "Any"]))
    if vacant_only:
        query = query.filter(PropertyListing.available_bedrooms > 0)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (PropertyListing.title.ilike(term)) |
            (PropertyListing.neighborhood.ilike(term)) |
            (PropertyListing.city.ilike(term)) |
            (PropertyListing.description.ilike(term))
        )

    properties = query.order_by(PropertyListing.created_at.desc()).all()
    return [_format_property_out(p, db) for p in properties]


@router.get("/my-listings", response_model=List[PropertyOut])
def get_my_listings(
    current_user: User = Depends(require_role(["property_owner", "flat_owner", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Returns properties owned by the authenticated property owner or flat owner.
    """
    properties = (
        db.query(PropertyListing)
        .filter(PropertyListing.owner_id == current_user.id, PropertyListing.status != "archived")
        .order_by(PropertyListing.created_at.desc())
        .all()
    )
    return [_format_property_out(p, db) for p in properties]


@router.get("/{property_id}", response_model=PropertyOut)
def get_property_detail(property_id: int, db: Session = Depends(get_db)):
    """
    Get detailed property information including room specifications and owner trust metrics.
    """
    p = db.query(PropertyListing).filter(PropertyListing.id == property_id).first()
    if not p or p.status == "archived":
        raise HTTPException(status_code=404, detail="Property listing not found")
    return _format_property_out(p, db)


@router.post("", response_model=PropertyOut, status_code=status.HTTP_201_CREATED)
def create_property(
    prop_in: PropertyCreate,
    current_user: User = Depends(require_role(["property_owner", "flat_owner", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Create a new property listing with optional initial rooms.
    Strictly verifies authorized role.
    """
    new_prop = PropertyListing(
        owner_id=current_user.id,
        title=prop_in.title.strip(),
        description=prop_in.description.strip() if prop_in.description else None,
        city=prop_in.city.strip(),
        neighborhood=prop_in.neighborhood.strip(),
        address=prop_in.address.strip() if prop_in.address else None,
        property_type=prop_in.property_type.strip(),
        total_bedrooms=prop_in.total_bedrooms,
        available_bedrooms=prop_in.available_bedrooms,
        monthly_rent=prop_in.monthly_rent,
        deposit_amount=prop_in.deposit_amount,
        furnishing_status=prop_in.furnishing_status,
        amenities=json.dumps(prop_in.amenities or []),
        image_urls=json.dumps(prop_in.image_urls or []),
        preferred_gender=prop_in.preferred_gender,
        food_preference=prop_in.food_preference,
        rules=json.dumps(prop_in.rules or []),
        status=prop_in.status,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_prop)
    db.commit()
    db.refresh(new_prop)

    # Add initial rooms if provided
    if prop_in.rooms:
        for r in prop_in.rooms:
            room = RoomListing(
                property_id=new_prop.id,
                title=r.title.strip(),
                room_type=r.room_type,
                rent=r.rent,
                deposit=r.deposit,
                is_vacant=r.is_vacant,
                available_from=r.available_from,
                furnishing=r.furnishing,
                amenities=json.dumps(r.amenities or []),
                created_at=datetime.utcnow()
            )
            db.add(room)
        db.commit()
        db.refresh(new_prop)

    return _format_property_out(new_prop, db)


@router.put("/{property_id}", response_model=PropertyOut)
def update_property(
    property_id: int,
    prop_in: PropertyUpdate,
    current_user: User = Depends(require_role(["property_owner", "flat_owner", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Update a property listing. Enforces ownership check:
    Only the listing owner or platform admin can update it.
    """
    prop = db.query(PropertyListing).filter(PropertyListing.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property listing not found")

    # Ownership check
    if prop.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only update listings that you own"
        )

    # Apply updates
    update_data = prop_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        if field in ["amenities", "image_urls", "rules"]:
            setattr(prop, field, json.dumps(val or []))
        else:
            setattr(prop, field, val)

    prop.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(prop)
    return _format_property_out(prop, db)


@router.delete("/{property_id}")
def archive_property(
    property_id: int,
    current_user: User = Depends(require_role(["property_owner", "flat_owner", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Archive a property listing. Enforces ownership check.
    Uses status='archived' to preserve application history.
    """
    prop = db.query(PropertyListing).filter(PropertyListing.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property listing not found")

    # Ownership check
    if prop.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only delete listings that you own"
        )

    prop.status = "archived"
    prop.updated_at = datetime.utcnow()
    db.commit()
    return {"status": "success", "message": f"Listing '{prop.title}' has been archived"}


@router.post("/{property_id}/rooms", response_model=RoomOut, status_code=status.HTTP_201_CREATED)
def add_room_to_property(
    property_id: int,
    room_in: RoomCreate,
    current_user: User = Depends(require_role(["property_owner", "flat_owner", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Add a room to an existing property. Enforces ownership check.
    """
    prop = db.query(PropertyListing).filter(PropertyListing.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property listing not found")

    if prop.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only add rooms to listings that you own"
        )

    room = RoomListing(
        property_id=prop.id,
        title=room_in.title.strip(),
        room_type=room_in.room_type,
        rent=room_in.rent,
        deposit=room_in.deposit,
        is_vacant=room_in.is_vacant,
        available_from=room_in.available_from,
        furnishing=room_in.furnishing,
        amenities=json.dumps(room_in.amenities or []),
        created_at=datetime.utcnow()
    )
    db.add(room)
    db.commit()
    db.refresh(room)

    return RoomOut(
        id=room.id,
        property_id=room.property_id,
        title=room.title,
        room_type=room.room_type,
        rent=room.rent,
        deposit=room.deposit,
        is_vacant=room.is_vacant,
        available_from=room.available_from,
        furnishing=room.furnishing,
        amenities=room_in.amenities or [],
        created_at=room.created_at
    )
