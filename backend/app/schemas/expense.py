from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class FlatMemberOut(BaseModel):
    id: int
    user_id: int
    room_label: str
    monthly_rent_share: float
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    upi_id: Optional[str] = None

    class Config:
        orm_mode = True

class FlatGroupCreate(BaseModel):
    name: str
    address: Optional[str] = None
    city: Optional[str] = "Bengaluru"
    total_rent: float

class FlatGroupOut(FlatGroupCreate):
    id: int
    created_at: datetime
    members: List[FlatMemberOut] = []

    class Config:
        orm_mode = True

class SplitItemCreate(BaseModel):
    user_id: int
    amount_owed: float

class ExpenseCreate(BaseModel):
    group_id: int
    title: str
    category: str  # Rent, Electricity, WiFi, Maid/Cook, Groceries, Maintenance, Miscellaneous
    total_amount: float
    split_type: Optional[str] = "equal"
    splits: Optional[List[SplitItemCreate]] = None

class ExpenseSplitOut(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    amount_owed: float
    is_paid: bool
    paid_at: Optional[datetime] = None
    upi_ref: Optional[str] = None

    class Config:
        orm_mode = True

class ExpenseOut(BaseModel):
    id: int
    group_id: int
    title: str
    category: str
    total_amount: float
    paid_by_id: int
    paid_by_name: Optional[str] = None
    split_type: str
    created_at: datetime
    splits: List[ExpenseSplitOut] = []

    class Config:
        orm_mode = True

class SettlementCreate(BaseModel):
    receiver_id: int
    amount: float
    payment_method: Optional[str] = "UPI"
    upi_txn_ref: Optional[str] = None
    note: Optional[str] = None

class SettlementOut(SettlementCreate):
    id: int
    payer_id: int
    payer_name: Optional[str] = None
    receiver_name: Optional[str] = None
    settled_at: datetime

    class Config:
        orm_mode = True

class UpiPaymentRequest(BaseModel):
    payee_upi: str
    payee_name: str
    amount: float
    note: Optional[str] = "RoomSync Rent/Expense Settlement"

class UpiPaymentResponse(BaseModel):
    upi_string: str
    qr_data_url: str
    amount: float
    payee_upi: str
    payee_name: str
