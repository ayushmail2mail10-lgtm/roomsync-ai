from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.profile import Profile
from ..models.expense import FlatGroup, FlatMember, Expense, ExpenseSplit, Settlement
from ..schemas.expense import (
    FlatGroupCreate, FlatGroupOut, FlatMemberOut,
    ExpenseCreate, ExpenseOut, ExpenseSplitOut,
    SettlementCreate, SettlementOut,
    UpiPaymentRequest, UpiPaymentResponse
)
from ..services.upi_service import generate_upi_uri, generate_mock_qr_svg
from ..services.auth_utils import get_current_user

router = APIRouter(prefix="/expenses", tags=["Rent & Expense Splitting"])

@router.get("/groups", response_model=List[FlatGroupOut])
def get_user_groups(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Find all flat groups the user belongs to
    memberships = db.query(FlatMember).filter(FlatMember.user_id == current_user.id).all()
    group_ids = [m.group_id for m in memberships]
    
    # If user doesn't belong to any group, also return group 1 as default demo shared flat
    if not group_ids:
        group_ids = [1]
        
    groups = db.query(FlatGroup).filter(FlatGroup.id.in_(group_ids)).all()
    
    result = []
    for g in groups:
        g_members = []
        for m in g.members:
            u = m.user
            p = u.profile if u else None
            g_members.append(
                FlatMemberOut(
                    id=m.id,
                    user_id=m.user_id,
                    room_label=m.room_label,
                    monthly_rent_share=m.monthly_rent_share,
                    full_name=u.full_name if u else "Flatmate",
                    avatar_url=p.avatar_url if p else None,
                    upi_id=p.upi_id if p else "roommate@upi"
                )
            )
        result.append(
            FlatGroupOut(
                id=g.id,
                name=g.name,
                address=g.address,
                city=g.city,
                total_rent=g.total_rent,
                created_at=g.created_at,
                members=g_members
            )
        )
    return result

@router.post("/groups", response_model=FlatGroupOut)
def create_flat_group(group_in: FlatGroupCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_group = FlatGroup(
        name=group_in.name,
        address=group_in.address,
        city=group_in.city,
        total_rent=group_in.total_rent
    )
    db.add(new_group)
    db.commit()
    db.refresh(new_group)

    # Add creator as flat member
    member = FlatMember(
        group_id=new_group.id,
        user_id=current_user.id,
        room_label="Master Bedroom with Balcony",
        monthly_rent_share=round(group_in.total_rent / 2, 2)
    )
    db.add(member)
    db.commit()
    db.refresh(new_group)

    p = current_user.profile
    members_out = [
        FlatMemberOut(
            id=member.id,
            user_id=current_user.id,
            room_label=member.room_label,
            monthly_rent_share=member.monthly_rent_share,
            full_name=current_user.full_name,
            avatar_url=p.avatar_url if p else None,
            upi_id=p.upi_id if p else "user@upi"
        )
    ]

    return FlatGroupOut(
        id=new_group.id,
        name=new_group.name,
        address=new_group.address,
        city=new_group.city,
        total_rent=new_group.total_rent,
        created_at=new_group.created_at,
        members=members_out
    )

@router.get("/groups/{group_id}/expenses", response_model=List[ExpenseOut])
def get_group_expenses(group_id: int, db: Session = Depends(get_db)):
    expenses = db.query(Expense).filter(Expense.group_id == group_id).order_by(Expense.created_at.desc()).all()
    output = []
    for exp in expenses:
        splits_out = []
        for s in exp.splits:
            u = s.user
            splits_out.append(
                ExpenseSplitOut(
                    id=s.id,
                    user_id=s.user_id,
                    user_name=u.full_name if u else "Flatmate",
                    amount_owed=s.amount_owed,
                    is_paid=s.is_paid,
                    paid_at=s.paid_at,
                    upi_ref=s.upi_ref
                )
            )
        output.append(
            ExpenseOut(
                id=exp.id,
                group_id=exp.group_id,
                title=exp.title,
                category=exp.category,
                total_amount=exp.total_amount,
                paid_by_id=exp.paid_by_id,
                paid_by_name=exp.paid_by.full_name if exp.paid_by else "Unknown",
                split_type=exp.split_type,
                created_at=exp.created_at,
                splits=splits_out
            )
        )
    return output

@router.post("/groups/{group_id}/expenses", response_model=ExpenseOut)
def add_expense(
    group_id: int,
    expense_in: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = db.query(FlatGroup).filter(FlatGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Flat group not found")

    new_expense = Expense(
        group_id=group_id,
        title=expense_in.title,
        category=expense_in.category,
        total_amount=expense_in.total_amount,
        paid_by_id=current_user.id,
        split_type=expense_in.split_type or "equal"
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    members = group.members
    num_members = len(members) if members else 1

    # Generate splits
    if expense_in.splits and len(expense_in.splits) > 0:
        for s in expense_in.splits:
            split_row = ExpenseSplit(
                expense_id=new_expense.id,
                user_id=s.user_id,
                amount_owed=s.amount_owed,
                is_paid=(s.user_id == current_user.id)
            )
            db.add(split_row)
    else:
        # Default equal split across all flatmates
        per_person = round(expense_in.total_amount / num_members, 2)
        for m in members:
            split_row = ExpenseSplit(
                expense_id=new_expense.id,
                user_id=m.user_id,
                amount_owed=per_person,
                is_paid=(m.user_id == current_user.id)
            )
            db.add(split_row)

    db.commit()
    db.refresh(new_expense)

    splits_out = [
        ExpenseSplitOut(
            id=s.id,
            user_id=s.user_id,
            user_name=s.user.full_name if s.user else "Flatmate",
            amount_owed=s.amount_owed,
            is_paid=s.is_paid,
            paid_at=s.paid_at,
            upi_ref=s.upi_ref
        )
        for s in new_expense.splits
    ]

    return ExpenseOut(
        id=new_expense.id,
        group_id=new_expense.group_id,
        title=new_expense.title,
        category=new_expense.category,
        total_amount=new_expense.total_amount,
        paid_by_id=new_expense.paid_by_id,
        paid_by_name=current_user.full_name,
        split_type=new_expense.split_type,
        created_at=new_expense.created_at,
        splits=splits_out
    )

@router.post("/splits/{split_id}/pay")
def mark_split_paid(
    split_id: int,
    upi_ref: Optional[str] = "UPI-AXIS-994821",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    split = db.query(ExpenseSplit).filter(ExpenseSplit.id == split_id).first()
    if not split:
        raise HTTPException(status_code=404, detail="Split item not found")

    split.is_paid = True
    split.paid_at = datetime.utcnow()
    split.upi_ref = upi_ref
    db.commit()

    return {"message": "Payment recorded successfully", "split_id": split_id, "upi_ref": upi_ref}

@router.post("/upi-qr", response_model=UpiPaymentResponse)
def generate_upi_payment(req: UpiPaymentRequest):
    uri = generate_upi_uri(
        payee_upi=req.payee_upi,
        payee_name=req.payee_name,
        amount=req.amount,
        note=req.note or "RoomSync Rent/Expense"
    )
    svg_qr = generate_mock_qr_svg(uri, req.payee_name, req.amount)
    return UpiPaymentResponse(
        upi_string=uri,
        qr_data_url=svg_qr,
        amount=req.amount,
        payee_upi=req.payee_upi,
        payee_name=req.payee_name
    )

@router.get("/dashboard-summary")
def get_dashboard_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Calculate user's active expenses & balances
    my_splits = db.query(ExpenseSplit).filter(ExpenseSplit.user_id == current_user.id).all()
    pending_to_pay = sum(s.amount_owed for s in my_splits if not s.is_paid)

    # Expenses paid by current user where others owe them
    my_paid_expenses = db.query(Expense).filter(Expense.paid_by_id == current_user.id).all()
    owed_to_me = 0.0
    for exp in my_paid_expenses:
        for s in exp.splits:
            if s.user_id != current_user.id and not s.is_paid:
                owed_to_me += s.amount_owed

    # User's monthly rent share
    member_record = db.query(FlatMember).filter(FlatMember.user_id == current_user.id).first()
    rent_share = member_record.monthly_rent_share if member_record else 16500.0
    flat_name = member_record.flat_group.name if member_record and member_record.flat_group else "Koramangala 3BHK Tech Nest"

    return {
        "monthly_rent_share": rent_share,
        "flat_name": flat_name,
        "pending_to_pay": round(pending_to_pay, 2),
        "owed_to_me": round(owed_to_me, 2),
        "net_balance": round(owed_to_me - pending_to_pay, 2),
        "rent_due_date": "1st of every month",
        "days_left_in_month": 12,
        "active_roommates_count": 3
    }
