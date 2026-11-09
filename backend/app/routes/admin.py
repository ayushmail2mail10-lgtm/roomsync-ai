from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.profile import Profile
from ..models.verification import Verification, ReportBlock
from ..models.expense import FlatGroup
from ..services.auth_utils import require_admin

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.get("/metrics")
def get_admin_metrics(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Returns platform-wide analytical statistics for authorized administrators only.
    Protected strictly by require_admin dependency.
    """
    total_users = db.query(User).count()
    tenants = db.query(User).filter(User.role == "tenant").count()
    property_owners = db.query(User).filter(User.role == "property_owner").count()
    flat_owners = db.query(User).filter(User.role == "flat_owner").count()
    admins = db.query(User).filter(User.role == "admin").count()

    active_flats = db.query(FlatGroup).count()
    pending_verifications = db.query(Verification).filter(Verification.aadhaar_verified == False).count()
    verified_users = db.query(Verification).filter(Verification.aadhaar_verified == True).count()
    total_reports = db.query(ReportBlock).count()

    return {
        "total_users": total_users,
        "tenants_count": tenants,
        "property_owners_count": property_owners,
        "flat_owners_count": flat_owners,
        "admins_count": admins,
        "active_flats_count": active_flats,
        "pending_verifications_count": pending_verifications,
        "verified_users_count": verified_users,
        "total_reports_count": total_reports,
        "system_status": "Healthy • Operational",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/users")
def get_admin_users(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    List all platform users with profile metadata and verification status for administrative moderation.
    """
    users = db.query(User).order_by(User.created_at.desc()).all()
    results = []
    for u in users:
        p = u.profile
        v = u.verification
        results.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "phone": u.phone,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "city": p.city if p else "Bengaluru",
            "neighborhood": p.neighborhood if p else "HSR Layout",
            "trust_score": v.trust_score if v else 50,
            "aadhaar_verified": v.aadhaar_verified if v else False,
            "work_email_verified": v.work_email_verified if v else False
        })
    return results

@router.post("/users/{user_id}/toggle-status")
def toggle_user_active_status(
    user_id: int,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Suspend or activate a user account.
    """
    if user_id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own administrator account.")

    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    target.is_active = not target.is_active
    db.commit()
    db.refresh(target)

    status_str = "activated" if target.is_active else "suspended"
    return {
        "status": "success",
        "user_id": target.id,
        "is_active": target.is_active,
        "message": f"User {target.full_name} ({target.email}) has been {status_str}."
    }

@router.post("/verifications/{user_id}/approve")
def approve_user_verification(
    user_id: int,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Admin manual override to approve Aadhaar & Government ID verification.
    """
    ver = db.query(Verification).filter(Verification.user_id == user_id).first()
    if not ver:
        ver = Verification(user_id=user_id, trust_score=50)
        db.add(ver)

    ver.aadhaar_verified = True
    ver.aadhaar_masked = ver.aadhaar_masked or "XXXXXXXX8888"
    ver.trust_score = min(100, ver.trust_score + 35)
    ver.verified_at = datetime.utcnow()
    db.commit()
    db.refresh(ver)

    return {
        "status": "success",
        "user_id": user_id,
        "aadhaar_verified": ver.aadhaar_verified,
        "trust_score": ver.trust_score,
        "message": f"User ID {user_id} verification approved by administrator."
    }

@router.get("/reports")
def get_admin_reports(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Retrieve user reports and audit logs for moderation.
    """
    reports = db.query(ReportBlock).order_by(ReportBlock.created_at.desc()).all()
    out = []
    for r in reports:
        reporter = db.query(User).filter(User.id == r.reporter_id).first()
        target = db.query(User).filter(User.id == r.target_id).first()
        out.append({
            "id": r.id,
            "action_type": r.action_type,
            "reason": r.reason,
            "description": r.description,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "reporter_name": reporter.full_name if reporter else f"User {r.reporter_id}",
            "reporter_email": reporter.email if reporter else None,
            "target_name": target.full_name if target else f"User {r.target_id}",
            "target_email": target.email if target else None,
            "target_role": target.role if target else "Unknown",
            "target_is_active": target.is_active if target else False
        })
    return out
