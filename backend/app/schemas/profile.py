from typing import Optional
from pydantic import BaseModel

class ProfileBase(BaseModel):
    age: Optional[int] = 25
    gender: Optional[str] = "Male"
    occupation: Optional[str] = "Software Engineer"
    company: Optional[str] = "Tech Startup"
    city: Optional[str] = "Bengaluru"
    neighborhood: Optional[str] = "HSR Layout"
    bio: Optional[str] = "Fintech dev who loves badminton, filter coffee, and clean shared spaces."
    avatar_url: Optional[str] = None
    upi_id: Optional[str] = "user@upi"
    
    budget_min: Optional[int] = 12000
    budget_max: Optional[int] = 22000
    housing_status: Optional[str] = "Need Flat & Roommate"
    target_move_in: Optional[str] = "Immediate"

    sleep_schedule: Optional[str] = "Normal (8 AM - 12 AM)"
    dietary_pref: Optional[str] = "Non-Veg"
    non_veg_cooking_allowed: Optional[str] = "Yes"
    smoking: Optional[str] = "Never"
    drinking: Optional[str] = "Socially"
    cleanliness: Optional[int] = 4
    wfh_status: Optional[str] = "Hybrid"
    pet_friendly: Optional[str] = "Loves Pets"
    guest_policy: Optional[str] = "Weekend Guests Allowed"
    cook_maid_pref: Optional[str] = "Wants Cook & Maid"
    interests: Optional[str] = "Tech, Badminton, Filter Coffee, Weekend Trips"

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileOut(ProfileBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
