from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class PropertyListing(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    city = Column(String(100), nullable=False, index=True)
    neighborhood = Column(String(100), nullable=False, index=True)
    address = Column(String(255), nullable=True)
    property_type = Column(String(100), nullable=False)  # e.g., "3 BHK Luxury Apartment", "2 BHK Flat", "Independent House"
    
    total_bedrooms = Column(Integer, default=1, nullable=False)
    available_bedrooms = Column(Integer, default=1, nullable=False)
    monthly_rent = Column(Integer, nullable=False)
    deposit_amount = Column(Integer, nullable=False)
    furnishing_status = Column(String(50), default="Semi Furnished", nullable=False)  # Fully Furnished, Semi Furnished, Unfurnished
    
    amenities = Column(Text, default="[]", nullable=False)  # JSON-encoded array
    image_urls = Column(Text, default="[]", nullable=False)  # JSON-encoded array
    preferred_gender = Column(String(50), default="Any", nullable=False)
    food_preference = Column(String(50), default="Flexible", nullable=False)
    rules = Column(Text, default="[]", nullable=False)  # JSON-encoded array
    status = Column(String(50), default="active", nullable=False, index=True)  # active, occupied, draft, archived
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    owner = relationship("User", foreign_keys=[owner_id])
    rooms = relationship("RoomListing", back_populates="property", cascade="all, delete-orphan")
    applications = relationship("PropertyApplication", back_populates="property", cascade="all, delete-orphan")


class RoomListing(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)  # e.g. "Private Master Bedroom with Attached Balcony"
    room_type = Column(String(100), default="Private Room", nullable=False)  # Master Bedroom, Private Room, Shared Room
    rent = Column(Integer, nullable=False)
    deposit = Column(Integer, nullable=False)
    is_vacant = Column(Boolean, default=True, nullable=False)
    available_from = Column(String(100), default="Immediate", nullable=False)
    furnishing = Column(String(255), nullable=True)
    amenities = Column(Text, default="[]", nullable=False)  # JSON-encoded array
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    property = relationship("PropertyListing", back_populates="rooms")
    applications = relationship("PropertyApplication", back_populates="room")


class PropertyApplication(Base):
    __tablename__ = "property_applications"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True, index=True)
    applicant_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    status = Column(String(50), default="pending", nullable=False, index=True)  # pending, shortlisted, accepted, rejected, withdrawn
    message = Column(Text, nullable=True)
    move_in_date = Column(String(100), nullable=True)
    proposed_budget = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    property = relationship("PropertyListing", back_populates="applications")
    room = relationship("RoomListing", back_populates="applications")
    applicant = relationship("User", foreign_keys=[applicant_id])
    owner = relationship("User", foreign_keys=[owner_id])
