from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class VerificationBase(BaseModel):
    aadhaar_verified: bool = False
    aadhaar_masked: Optional[str] = None
    pan_verified: bool = False
    pan_masked: Optional[str] = None
    work_email_verified: bool = False
    work_email: Optional[str] = None
    company_name: Optional[str] = None
    phone_verified: bool = True
    trust_score: int = 45

class VerificationOut(VerificationBase):
    id: int
    user_id: int
    verified_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class AadhaarVerifyRequest(BaseModel):
    aadhaar_number: str  # 12-digit format
    otp: str             # Simulated OTP (e.g. 123456)

class PanVerifyRequest(BaseModel):
    pan_number: str      # 10-character PAN format
    full_name: str

class WorkEmailVerifyRequest(BaseModel):
    work_email: str
    company_name: str

class SafeMeetCreate(BaseModel):
    receiver_id: int
    cafe_name: str
    location_address: str
    meetup_date: str
    meetup_time: str
    notes: Optional[str] = None

class SafeMeetOut(SafeMeetCreate):
    id: int
    sender_id: int
    status: str
    created_at: datetime

    class Config:
        orm_mode = True

class ReportBlockCreate(BaseModel):
    target_id: int
    action_type: str  # "report" or "block"
    reason: str
    description: Optional[str] = None
