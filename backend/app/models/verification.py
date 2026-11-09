from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Verification(Base):
    __tablename__ = "verifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Aadhaar verification (DigiLocker standard)
    aadhaar_verified = Column(Boolean, default=False)
    aadhaar_masked = Column(String, nullable=True)  # e.g., "XXXXXXXX4921"
    
    # PAN verification
    pan_verified = Column(Boolean, default=False)
    pan_masked = Column(String, nullable=True)  # e.g., "ABCDE****Z"
    
    # Work / College verification
    work_email_verified = Column(Boolean, default=False)
    work_email = Column(String, nullable=True)
    company_name = Column(String, nullable=True)

    # Phone verification
    phone_verified = Column(Boolean, default=True)

    # Trust Score (0 - 100)
    trust_score = Column(Integer, default=45)
    verified_at = Column(DateTime, nullable=True)

    # Relationship
    user = relationship("User", back_populates="verification")

class SafeMeet(Base):
    __tablename__ = "safe_meets"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    cafe_name = Column(String, nullable=False)  # e.g., "Third Wave Coffee, HSR Layout"
    location_address = Column(String, nullable=False)
    meetup_date = Column(String, nullable=False)  # "2026-11-15"
    meetup_time = Column(String, nullable=False)  # "17:00"
    status = Column(String, default="Pending")  # "Pending", "Accepted", "Completed", "Declined"
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ReportBlock(Base):
    __tablename__ = "report_blocks"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action_type = Column(String, nullable=False)  # "report" or "block"
    reason = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
