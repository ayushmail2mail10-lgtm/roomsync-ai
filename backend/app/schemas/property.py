from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, validator

# --- ROOM SCHEMAS ---

class RoomBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    room_type: str = Field("Private Room", max_length=100)
    rent: int = Field(..., gt=0, description="Monthly rent for the room in INR")
    deposit: int = Field(..., ge=0, description="Security deposit for the room in INR")
    is_vacant: bool = True
    available_from: str = "Immediate"
    furnishing: Optional[str] = None
    amenities: List[str] = []

class RoomCreate(RoomBase):
    pass

class RoomOut(RoomBase):
    id: int
    property_id: int
    created_at: datetime

    class Config:
        orm_mode = True


# --- PROPERTY SCHEMAS ---

class PropertyBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    description: Optional[str] = None
    city: str = Field(..., min_length=2, max_length=100)
    neighborhood: str = Field(..., min_length=2, max_length=100)
    address: Optional[str] = None
    property_type: str = Field("3 BHK Apartment", max_length=100)
    total_bedrooms: int = Field(1, ge=1, le=20)
    available_bedrooms: int = Field(1, ge=0, le=20)
    monthly_rent: int = Field(..., gt=0, description="Monthly rent in INR")
    deposit_amount: int = Field(..., ge=0, description="Security deposit in INR")
    furnishing_status: str = Field("Semi Furnished", regex="^(Fully Furnished|Semi Furnished|Unfurnished)$")
    amenities: List[str] = []
    image_urls: List[str] = []
    preferred_gender: str = Field("Any", max_length=50)
    food_preference: str = Field("Flexible", max_length=50)
    rules: List[str] = []
    status: str = Field("active", regex="^(active|occupied|draft|archived)$")

    @validator("available_bedrooms")
    def validate_available_bedrooms(cls, v, values):
        total = values.get("total_bedrooms", 1)
        if v > total:
            raise ValueError("Available bedrooms cannot exceed total bedrooms")
        return v

class PropertyCreate(PropertyBase):
    rooms: Optional[List[RoomCreate]] = []

class PropertyUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=255)
    description: Optional[str] = None
    city: Optional[str] = None
    neighborhood: Optional[str] = None
    address: Optional[str] = None
    property_type: Optional[str] = None
    total_bedrooms: Optional[int] = Field(None, ge=1, le=20)
    available_bedrooms: Optional[int] = Field(None, ge=0, le=20)
    monthly_rent: Optional[int] = Field(None, gt=0)
    deposit_amount: Optional[int] = Field(None, ge=0)
    furnishing_status: Optional[str] = Field(None, regex="^(Fully Furnished|Semi Furnished|Unfurnished)$")
    amenities: Optional[List[str]] = None
    image_urls: Optional[List[str]] = None
    preferred_gender: Optional[str] = None
    food_preference: Optional[str] = None
    rules: Optional[List[str]] = None
    status: Optional[str] = Field(None, regex="^(active|occupied|draft|archived)$")

class OwnerSummary(BaseModel):
    id: int
    name: str
    email: str
    avatar_url: Optional[str] = None
    trust_score: int = 80
    verified: bool = False

class PropertyOut(BaseModel):
    id: int
    owner_id: int
    owner: Optional[OwnerSummary] = None
    title: str
    description: Optional[str] = None
    city: str
    neighborhood: str
    address: Optional[str] = None
    property_type: str
    total_bedrooms: int
    available_bedrooms: int
    monthly_rent: int
    deposit_amount: int
    furnishing_status: str
    amenities: List[str] = []
    image_urls: List[str] = []
    preferred_gender: str
    food_preference: str
    rules: List[str] = []
    status: str
    rooms: List[RoomOut] = []
    applications_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# --- APPLICATION SCHEMAS ---

class ApplicationCreate(BaseModel):
    room_id: Optional[int] = None
    message: Optional[str] = Field(None, max_length=1000)
    move_in_date: Optional[str] = Field(None, max_length=100)
    proposed_budget: Optional[int] = Field(None, gt=0)

class ApplicationDecision(BaseModel):
    decision: str = Field(..., regex="^(accepted|rejected|shortlisted)$")

class ApplicantSummary(BaseModel):
    id: int
    name: str
    email: str
    avatar_url: Optional[str] = None
    occupation: Optional[str] = None
    company: Optional[str] = None
    trust_score: int = 80
    compatibility_score: Optional[int] = None

class PropertyApplicationOut(BaseModel):
    id: int
    property_id: int
    property_title: str
    property_city: str
    property_neighborhood: str
    property_monthly_rent: int
    property_image: Optional[str] = None
    room_id: Optional[int] = None
    room_title: Optional[str] = None
    room_rent: Optional[int] = None
    applicant_id: int
    applicant: ApplicantSummary
    owner_id: int
    owner_name: str
    status: str
    message: Optional[str] = None
    move_in_date: Optional[str] = None
    proposed_budget: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
