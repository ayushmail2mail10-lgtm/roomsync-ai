from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Demographics & Location
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)  # Male, Female, Non-Binary
    occupation = Column(String, nullable=True)  # Software Engineer, Product Manager, etc.
    company = Column(String, nullable=True)  # Razorpay, Swiggy, Google, etc.
    city = Column(String, default="Bengaluru", index=True)
    neighborhood = Column(String, default="HSR Layout", index=True)  # HSR, Koramangala, Indiranagar
    bio = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    upi_id = Column(String, nullable=True)  # e.g., rahul@okhdfcbank

    # Housing Preferences & Budget
    budget_min = Column(Integer, default=12000)
    budget_max = Column(Integer, default=22000)
    housing_status = Column(String, default="Need Flat & Roommate")  # "Has Flat / Has Room", "Need Flat & Roommate"
    target_move_in = Column(String, default="Immediate")  # Immediate, 15 Days, Next Month

    # Lifestyle & Habits
    sleep_schedule = Column(String, default="Normal (8 AM - 12 AM)")  # "Early Bird (6 AM - 10 PM)", "Normal (8 AM - 12 AM)", "Night Owl (2 PM - 3 AM)"
    dietary_pref = Column(String, default="Non-Veg")  # "Pure Veg", "Eggetarian", "Non-Veg", "Jain", "Vegan"
    non_veg_cooking_allowed = Column(String, default="Yes")  # "Yes", "No", "Outside only"
    smoking = Column(String, default="Never")  # "Never", "Socially", "Regularly", "Balcony Only"
    drinking = Column(String, default="Socially")  # "Never", "Socially", "Regularly"
    cleanliness = Column(Integer, default=4)  # 1 to 5
    wfh_status = Column(String, default="Hybrid")  # "Full Remote", "Hybrid", "Office (5 Days)"
    pet_friendly = Column(String, default="Loves Pets")  # "Has Pet", "Loves Pets", "No Pets/Allergic"
    guest_policy = Column(String, default="Weekend Guests Allowed")  # "No Guests", "Day Guests Only", "Weekend Guests Allowed", "Very Flexible"
    cook_maid_pref = Column(String, default="Wants Cook & Maid")  # "Wants Cook & Maid", "Only Maid", "Cook Own Meals"
    interests = Column(String, default="Tech, Badminton, Filter Coffee, Weekend Trips")

    # Relationships
    user = relationship("User", back_populates="profile")
