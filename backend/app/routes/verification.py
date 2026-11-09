import re
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.verification import Verification, SafeMeet, ReportBlock
from ..schemas.verification import (
    VerificationOut, AadhaarVerifyRequest, PanVerifyRequest,
    WorkEmailVerifyRequest, SafeMeetCreate, SafeMeetOut, ReportBlockCreate
)
from ..services.auth_utils import get_current_user

router = APIRouter(prefix="/verification", tags=["Safety & Trust Verification"])

RECOMMENDED_SAFEMEET_CAFES = [
    {"name": "Third Wave Coffee", "area": "HSR Layout, Sector 4", "city": "Bengaluru", "verified": True},
    {"name": "Blue Tokai Coffee Roasters", "area": "Indiranagar 100ft Rd", "city": "Bengaluru", "verified": True},
    {"name": "Starbucks Coffee", "area": "Koramangala 5th Block", "city": "Bengaluru", "verified": True},
    {"name": "Subko Coffee Roasters", "area": "Bandra West", "city": "Mumbai", "verified": True},
    {"name": "Dunkin' Donuts", "area": "Cyber Hub", "city": "Gurgaon", "verified": True},
    {"name": "Roastery Coffee House", "area": "Banjara Hills", "city": "Hyderabad", "verified": True}
]

@router.get("/status", response_model=VerificationOut)
def get_verification_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ver = db.query(Verification).filter(Verification.user_id == current_user.id).first()
    if not ver:
        ver = Verification(user_id=current_user.id, trust_score=50, phone_verified=True)
        db.add(ver)
        db.commit()
        db.refresh(ver)
    return ver

@router.get("/cafes")
def get_safemeet_cafes():
    return RECOMMENDED_SAFEMEET_CAFES

@router.post("/verify-aadhaar", response_model=VerificationOut)
def verify_aadhaar(
    req: AadhaarVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    clean_aadhaar = re.sub(r"\D", "", req.aadhaar_number)
    if len(clean_aadhaar) != 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aadhaar number must be exactly 12 digits"
        )

    ver = db.query(Verification).filter(Verification.user_id == current_user.id).first()
    if not ver:
        ver = Verification(user_id=current_user.id)
        db.add(ver)

    # Mask Aadhaar (UIDAI format: XXXXXXXX1234)
    masked = f"XXXXXXXX{clean_aadhaar[-4:]}"
    ver.aadhaar_verified = True
    ver.aadhaar_masked = masked
    ver.trust_score = min(100, ver.trust_score + 25)
    ver.verified_at = datetime.utcnow()
    db.commit()
    db.refresh(ver)
    return ver

@router.post("/verify-pan", response_model=VerificationOut)
def verify_pan(
    req: PanVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pan = req.pan_number.strip().upper()
    if len(pan) != 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PAN number must be exactly 10 alphanumeric characters"
        )

    ver = db.query(Verification).filter(Verification.user_id == current_user.id).first()
    if not ver:
        ver = Verification(user_id=current_user.id)
        db.add(ver)

    masked_pan = f"{pan[:5]}****{pan[-1]}"
    ver.pan_verified = True
    ver.pan_masked = masked_pan
    ver.trust_score = min(100, ver.trust_score + 20)
    ver.verified_at = datetime.utcnow()
    db.commit()
    db.refresh(ver)
    return ver

@router.post("/verify-work-email", response_model=VerificationOut)
def verify_work_email(
    req: WorkEmailVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    email = req.work_email.strip().lower()
    if "@gmail.com" in email or "@yahoo.com" in email or "@outlook.com" in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a corporate domain email (e.g. yourname@company.com)"
        )

    ver = db.query(Verification).filter(Verification.user_id == current_user.id).first()
    if not ver:
        ver = Verification(user_id=current_user.id)
        db.add(ver)

    ver.work_email_verified = True
    ver.work_email = email
    ver.company_name = req.company_name
    ver.trust_score = min(100, ver.trust_score + 15)
    db.commit()
    db.refresh(ver)
    return ver

@router.get("/safe-meets", response_model=List[SafeMeetOut])
def get_my_safe_meets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    meets = db.query(SafeMeet).filter(
        (SafeMeet.sender_id == current_user.id) | (SafeMeet.receiver_id == current_user.id)
    ).order_by(SafeMeet.created_at.desc()).all()
    return meets

@router.post("/safe-meets", response_model=SafeMeetOut)
def schedule_safe_meet(
    meet_in: SafeMeetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meet = SafeMeet(
        sender_id=current_user.id,
        receiver_id=meet_in.receiver_id,
        cafe_name=meet_in.cafe_name,
        location_address=meet_in.location_address,
        meetup_date=meet_in.meetup_date,
        meetup_time=meet_in.meetup_time,
        notes=meet_in.notes,
        status="Pending"
    )
    db.add(meet)
    db.commit()
    db.refresh(meet)
    return meet

@router.post("/report-block")
def report_or_block(
    rb_in: ReportBlockCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = ReportBlock(
        reporter_id=current_user.id,
        target_id=rb_in.target_id,
        action_type=rb_in.action_type,
        reason=rb_in.reason,
        description=rb_in.description
    )
    db.add(record)
    db.commit()
    return {
        "status": "success",
        "action": rb_in.action_type,
        "message": f"User has been {rb_in.action_type}ed. Our trust & safety team has received the audit flag."
    }
