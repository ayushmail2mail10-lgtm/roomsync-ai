from typing import List, Optional
from pydantic import BaseModel
from .profile import ProfileOut
from .verification import VerificationOut

class CompatibilityBreakdown(BaseModel):
    overall_score: int
    budget_score: int
    dietary_score: int
    sleep_score: int
    cleanliness_score: int
    social_score: int
    location_score: int
    vibe_summary: str
    highlights: List[str]
    watchouts: List[str]

class RoommateMatchOut(BaseModel):
    user_id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    profile: ProfileOut
    verification: Optional[VerificationOut] = None
    compatibility: CompatibilityBreakdown

    class Config:
        orm_mode = True

class MatchFilterParams(BaseModel):
    city: Optional[str] = None
    neighborhood: Optional[str] = None
    max_budget: Optional[int] = None
    dietary_pref: Optional[str] = None
    smoking: Optional[str] = None
    sleep_schedule: Optional[str] = None
    min_cleanliness: Optional[int] = None
