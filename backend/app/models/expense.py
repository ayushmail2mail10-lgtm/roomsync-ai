from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class FlatGroup(Base):
    __tablename__ = "flat_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # e.g., "Skyline 3BHK - HSR Sector 2"
    address = Column(String, nullable=True)
    city = Column(String, default="Bengaluru")
    total_rent = Column(Float, default=45000.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    members = relationship("FlatMember", back_populates="flat_group", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="flat_group", cascade="all, delete-orphan")

class FlatMember(Base):
    __tablename__ = "flat_members"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("flat_groups.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    room_label = Column(String, default="Standard Bedroom")  # "Master Bedroom with Attached Washroom", "Bedroom 2", etc.
    monthly_rent_share = Column(Float, default=15000.0)
    joined_at = Column(DateTime, default=datetime.utcnow)

    flat_group = relationship("FlatGroup", back_populates="members")
    user = relationship("User")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("flat_groups.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)  # e.g., "BESCOM Electricity Bill - Oct", "Cook & Maid Salary"
    category = Column(String, default="Utilities")  # Rent, Electricity, WiFi, Maid/Cook, Groceries, Maintenance, Miscellaneous
    total_amount = Column(Float, nullable=False)
    paid_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    split_type = Column(String, default="equal")  # "equal", "custom", "rent_based"
    created_at = Column(DateTime, default=datetime.utcnow)

    flat_group = relationship("FlatGroup", back_populates="expenses")
    paid_by = relationship("User")
    splits = relationship("ExpenseSplit", back_populates="expense", cascade="all, delete-orphan")

class ExpenseSplit(Base):
    __tablename__ = "expense_splits"

    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount_owed = Column(Float, nullable=False)
    is_paid = Column(Boolean, default=False)
    paid_at = Column(DateTime, nullable=True)
    upi_ref = Column(String, nullable=True)  # Bank/UPI transaction UTR number

    expense = relationship("Expense", back_populates="splits")
    user = relationship("User")

class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(Integer, primary_key=True, index=True)
    payer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String, default="UPI")
    upi_txn_ref = Column(String, nullable=True)
    note = Column(String, nullable=True)
    settled_at = Column(DateTime, default=datetime.utcnow)

    payer = relationship("User", foreign_keys=[payer_id])
    receiver = relationship("User", foreign_keys=[receiver_id])
