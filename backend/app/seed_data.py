from datetime import datetime
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models.user import User
from .models.profile import Profile
from .models.verification import Verification, SafeMeet
from .models.expense import FlatGroup, FlatMember, Expense, ExpenseSplit
from .models.chat import Conversation, Message
from .services.auth_utils import get_password_hash
from .config import settings

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    existing_users = db.query(User).count()
    if existing_users > 0:
        db.close()
        return

    print("Seeding Indian co-living profiles and flat data for RoomSync AI...")

    # 1. Primary User (Arjun Mehta - The logged-in demo persona)
    primary_user = User(
        email="arjun@roomsync.ai",
        hashed_password=get_password_hash("password123"),
        full_name="Arjun Mehta",
        phone="+91 98765 43210",
        role="flat_owner",
        is_active=True
    )
    db.add(primary_user)
    db.flush()

    p_arjun = Profile(
        user_id=primary_user.id,
        age=26,
        gender="Male",
        occupation="Senior Frontend Engineer",
        company="Swiggy",
        city="Bengaluru",
        neighborhood="HSR Layout Sector 2",
        bio="Full-stack dev at Swiggy. Passionate about clean code, badminton on weekends, and keeping living spaces tidy. Looking for chill flatmates who respect quiet hours after 11 PM.",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        upi_id="arjun.mehta@oksbi",
        budget_min=15000,
        budget_max=24000,
        housing_status="Has Flat / Has Room",
        target_move_in="Immediate",
        sleep_schedule="Normal (8 AM - 12 AM)",
        dietary_pref="Pure Veg",
        non_veg_cooking_allowed="Yes",
        smoking="Never",
        drinking="Socially",
        cleanliness=4,
        wfh_status="Hybrid",
        pet_friendly="Loves Pets",
        guest_policy="Weekend Guests Allowed",
        cook_maid_pref="Wants Cook & Maid",
        interests="React, Filter Coffee, Badminton, Weekend Treks, Indie Music"
    )
    db.add(p_arjun)

    v_arjun = Verification(
        user_id=primary_user.id,
        aadhaar_verified=True,
        aadhaar_masked="XXXXXXXX8921",
        pan_verified=True,
        pan_masked="AAAPM****M",
        work_email_verified=True,
        work_email="arjun.mehta@swiggy.in",
        company_name="Swiggy",
        phone_verified=True,
        trust_score=95,
        verified_at=datetime.utcnow()
    )
    db.add(v_arjun)

    # 2. Seed Flatmates across Bengaluru, Mumbai, Gurgaon, Pune, Hyderabad
    flatmates_data = [
        {
            "name": "Rohan Verma",
            "email": "rohan.verma@roomsync.ai",
            "phone": "+91 98201 11223",
            "age": 25,
            "gender": "Male",
            "occupation": "Backend Platform Engineer",
            "company": "Razorpay",
            "city": "Bengaluru",
            "neighborhood": "Koramangala 4th Block",
            "bio": "Distributed systems engineer. Big on cleanliness, gaming, and specialty coffee. Very considerate with noise during work hours.",
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            "upi": "rohan.razor@okaxis",
            "budget_min": 16000,
            "budget_max": 25000,
            "status": "Need Flat & Roommate",
            "sleep": "Normal (8 AM - 12 AM)",
            "diet": "Non-Veg",
            "non_veg_cooking": "Yes",
            "smoke": "Never",
            "drink": "Socially",
            "clean": 4,
            "wfh": "Hybrid",
            "pets": "Loves Pets",
            "guests": "Weekend Guests Allowed",
            "maid": "Wants Cook & Maid",
            "interests": "Rust, Valorant, Specialty Pour-overs, Gym",
            "aadhaar": "XXXXXXXX3412",
            "pan": "BCEPV****K",
            "work_email": "rohan.v@razorpay.com",
            "trust": 92
        },
        {
            "name": "Vikram Iyer",
            "email": "vikram.iyer@roomsync.ai",
            "role": "flat_owner",
            "phone": "+91 97412 88391",
            "age": 27,
            "gender": "Male",
            "occupation": "Data Scientist",
            "company": "Flipkart",
            "city": "Bengaluru",
            "neighborhood": "HSR Layout Sector 1",
            "bio": "Pure veg, quiet, early morning runner. Looking for a respectful flatmate in HSR or Bellandur. Always prompt with rent & utility payments.",
            "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
            "upi": "vikram.iyer@okhdfcbank",
            "budget_min": 14000,
            "budget_max": 22000,
            "status": "Has Flat / Has Room",
            "sleep": "Early Bird (6 AM - 10 PM)",
            "diet": "Pure Veg",
            "non_veg_cooking": "Outside only",
            "smoke": "Never",
            "drink": "Never",
            "clean": 5,
            "wfh": "Full Remote",
            "pets": "No Pets/Allergic",
            "guests": "Day Guests Only",
            "maid": "Wants Cook & Maid",
            "interests": "Machine Learning, Carnatic Flute, Marathon Training, Reading",
            "aadhaar": "XXXXXXXX9184",
            "pan": "AQXPI****R",
            "work_email": "vikram.iyer@flipkart.com",
            "trust": 98
        },
        {
            "name": "Ananya Sharma",
            "email": "ananya.sharma@roomsync.ai",
            "phone": "+91 98112 55667",
            "age": 24,
            "gender": "Female",
            "occupation": "Product Designer",
            "company": "CRED",
            "city": "Bengaluru",
            "neighborhood": "Indiranagar",
            "bio": "UI/UX obsessive. Love minimal interiors, plants, and weekend pottery. Looking for warm, hygienic flatmates who enjoy occasional shared dinners.",
            "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
            "upi": "ananya.design@icici",
            "budget_min": 18000,
            "budget_max": 28000,
            "status": "Need Flat & Roommate",
            "sleep": "Normal (8 AM - 12 AM)",
            "diet": "Eggetarian",
            "non_veg_cooking": "Yes",
            "smoke": "Never",
            "drink": "Socially",
            "clean": 5,
            "wfh": "Hybrid",
            "pets": "Loves Pets",
            "guests": "Weekend Guests Allowed",
            "maid": "Wants Cook & Maid",
            "interests": "Figma, Ceramic Arts, Houseplants, Indie Cafes",
            "aadhaar": "XXXXXXXX7723",
            "pan": "BNQPS****E",
            "work_email": "ananya@cred.club",
            "trust": 94
        },
        {
            "name": "Aditi Nair",
            "email": "aditi.nair@roomsync.ai",
            "phone": "+91 99014 33219",
            "age": 25,
            "gender": "Female",
            "occupation": "Growth Marketing Lead",
            "company": "Meesho",
            "city": "Bengaluru",
            "neighborhood": "HSR Layout Sector 4",
            "bio": "Sociable, energetic, and love weekend brunches. Respect personal space during weekdays. Looking for friendly flatmates in HSR or Koramangala.",
            "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
            "upi": "aditi.nair@paytm",
            "budget_min": 15000,
            "budget_max": 23000,
            "status": "Need Flat & Roommate",
            "sleep": "Normal (8 AM - 12 AM)",
            "diet": "Non-Veg",
            "non_veg_cooking": "Yes",
            "smoke": "Balcony Only",
            "drink": "Socially",
            "clean": 4,
            "wfh": "Hybrid",
            "pets": "Loves Pets",
            "guests": "Very Flexible",
            "maid": "Wants Cook & Maid",
            "interests": "Growth Hacking, Pilates, Standup Comedy, Travel",
            "aadhaar": "XXXXXXXX6190",
            "pan": "CSAPN****B",
            "work_email": "aditi.n@meesho.com",
            "trust": 88
        },
        {
            "name": "Kabir Malhotra",
            "email": "kabir.malhotra@roomsync.ai",
            "phone": "+91 98711 99882",
            "age": 26,
            "gender": "Male",
            "occupation": "Product Operations",
            "company": "Zomato",
            "city": "Gurgaon",
            "neighborhood": "Cyber City / Golf Course Rd",
            "bio": "Fast-paced startup life. Love weekend board game nights and football screenings. Very transparent about split expenses.",
            "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
            "upi": "kabir.m@okhdfcbank",
            "budget_min": 18000,
            "budget_max": 30000,
            "status": "Need Flat & Roommate",
            "sleep": "Night Owl (2 PM - 3 AM)",
            "diet": "Non-Veg",
            "non_veg_cooking": "Yes",
            "smoke": "Socially",
            "drink": "Socially",
            "clean": 3,
            "wfh": "Hybrid",
            "pets": "Has Pet",
            "guests": "Weekend Guests Allowed",
            "maid": "Wants Cook & Maid",
            "interests": "Football (Arsenal), Premier League, Board Games, Tech Podcasts",
            "aadhaar": "XXXXXXXX5211",
            "pan": "DHPMK****C",
            "work_email": "kabir.m@zomato.com",
            "trust": 85
        },
        {
            "name": "Sneha Kulkarni",
            "email": "sneha.kulkarni@roomsync.ai",
            "role": "property_owner",
            "phone": "+91 98200 44556",
            "age": 27,
            "gender": "Female",
            "occupation": "Management Consultant",
            "company": "Bain & Company",
            "city": "Mumbai",
            "neighborhood": "Powai / Hiranandani",
            "bio": "Travel often for client work Mon-Thu. Value a calm, serene sanctuary on weekends. Looking for a neat flatmate in Powai or Bandra.",
            "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
            "upi": "sneha.k@icici",
            "budget_min": 25000,
            "budget_max": 40000,
            "status": "Has Flat / Has Room",
            "sleep": "Normal (8 AM - 12 AM)",
            "diet": "Eggetarian",
            "non_veg_cooking": "Yes",
            "smoke": "Never",
            "drink": "Socially",
            "clean": 5,
            "wfh": "Office (5 Days)",
            "pets": "No Pets/Allergic",
            "guests": "Day Guests Only",
            "maid": "Wants Cook & Maid",
            "interests": "Yoga, Strategy, Wine Tasting, Historical Fiction",
            "aadhaar": "XXXXXXXX4198",
            "pan": "EXPSK****A",
            "work_email": "sneha.k@bain.com",
            "trust": 96
        },
        {
            "name": "Pooja Reddy",
            "email": "pooja.reddy@roomsync.ai",
            "phone": "+91 90001 22334",
            "age": 24,
            "gender": "Female",
            "occupation": "Cloud Engineer",
            "company": "Microsoft",
            "city": "Hyderabad",
            "neighborhood": "Gachibowli / Financial District",
            "bio": "Working at Microsoft IDC. Early riser, love cooking South Indian breakfasts, and badminton. Looking for a quiet, organized flatmate.",
            "avatar": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
            "upi": "pooja.reddy@okaxis",
            "budget_min": 12000,
            "budget_max": 20000,
            "status": "Need Flat & Roommate",
            "sleep": "Early Bird (6 AM - 10 PM)",
            "diet": "Pure Veg",
            "non_veg_cooking": "No",
            "smoke": "Never",
            "drink": "Never",
            "clean": 5,
            "wfh": "Hybrid",
            "pets": "Loves Pets",
            "guests": "Day Guests Only",
            "maid": "Cook Own Meals",
            "interests": "Azure, Classical Dance, Badminton, Healthy Cooking",
            "aadhaar": "XXXXXXXX9012",
            "pan": "FYTPR****L",
            "work_email": "pooja.reddy@microsoft.com",
            "trust": 99
        }
    ]

    created_users = [primary_user]

    for item in flatmates_data:
        u = User(
            email=item["email"],
            hashed_password=get_password_hash("password123"),
            full_name=item["name"],
            phone=item["phone"],
            role=item.get("role", "tenant"),
            is_active=True
        )
        db.add(u)
        db.flush()
        created_users.append(u)

        p = Profile(
            user_id=u.id,
            age=item["age"],
            gender=item["gender"],
            occupation=item["occupation"],
            company=item["company"],
            city=item["city"],
            neighborhood=item["neighborhood"],
            bio=item["bio"],
            avatar_url=item["avatar"],
            upi_id=item["upi"],
            budget_min=item["budget_min"],
            budget_max=item["budget_max"],
            housing_status=item["status"],
            target_move_in="Immediate",
            sleep_schedule=item["sleep"],
            dietary_pref=item["diet"],
            non_veg_cooking_allowed=item["non_veg_cooking"],
            smoking=item["smoke"],
            drinking=item["drink"],
            cleanliness=item["clean"],
            wfh_status=item["wfh"],
            pet_friendly=item["pets"],
            guest_policy=item["guests"],
            cook_maid_pref=item["maid"],
            interests=item["interests"]
        )
        db.add(p)

        v = Verification(
            user_id=u.id,
            aadhaar_verified=True,
            aadhaar_masked=item["aadhaar"],
            pan_verified=True,
            pan_masked=item["pan"],
            work_email_verified=True,
            work_email=item["work_email"],
            company_name=item["company"],
            phone_verified=True,
            trust_score=item["trust"],
            verified_at=datetime.utcnow()
        )
        db.add(v)

    # 3. Create Shared Flat Group with Rent and Utilities Breakdown
    # Skyline Residency 3BHK, HSR Layout Sector 2
    flat = FlatGroup(
        name="Skyline Green 3BHK - HSR Sector 2",
        address="14th Main, Sector 2, HSR Layout, Bengaluru",
        city="Bengaluru",
        total_rent=51000.0
    )
    db.add(flat)
    db.flush()

    # Add Arjun (User 1), Rohan (User 2), Vikram (User 3)
    memberships = [
        (created_users[0].id, "Master Bedroom with Attached Balcony", 18500.0),
        (created_users[1].id, "Bedroom 2 with Attached Bath", 17000.0),
        (created_users[2].id, "Bedroom 3 (East Facing)", 15500.0)
    ]
    for uid, room, share in memberships:
        fm = FlatMember(
            group_id=flat.id,
            user_id=uid,
            room_label=room,
            monthly_rent_share=share
        )
        db.add(fm)

    # Add realistic monthly utility expenses
    exp1 = Expense(
        group_id=flat.id,
        title="BESCOM Electricity Bill (October)",
        category="Electricity",
        total_amount=3900.0,
        paid_by_id=created_users[0].id,
        split_type="equal"
    )
    db.add(exp1)
    db.flush()

    for u in created_users[:3]:
        db.add(ExpenseSplit(
            expense_id=exp1.id,
            user_id=u.id,
            amount_owed=1300.0,
            is_paid=(u.id == created_users[0].id)
        ))

    exp2 = Expense(
        group_id=flat.id,
        title="Airtel Xstream Fiber 300Mbps",
        category="WiFi",
        total_amount=1414.0,
        paid_by_id=created_users[1].id,
        split_type="equal"
    )
    db.add(exp2)
    db.flush()

    for u in created_users[:3]:
        db.add(ExpenseSplit(
            expense_id=exp2.id,
            user_id=u.id,
            amount_owed=471.33,
            is_paid=(u.id == created_users[1].id)
        ))

    exp3 = Expense(
        group_id=flat.id,
        title="Cook & Maid Monthly Salary (Laxmi Akka)",
        category="Maid/Cook",
        total_amount=10500.0,
        paid_by_id=created_users[0].id,
        split_type="equal"
    )
    db.add(exp3)
    db.flush()

    for u in created_users[:3]:
        db.add(ExpenseSplit(
            expense_id=exp3.id,
            user_id=u.id,
            amount_owed=3500.0,
            is_paid=(u.id == created_users[0].id)
        ))

    # 4. Create Initial Conversations & Messages with Icebreaker examples
    c1 = Conversation(user_one_id=created_users[0].id, user_two_id=created_users[1].id)
    db.add(c1)
    db.flush()

    m1 = Message(
        conversation_id=c1.id,
        sender_id=created_users[1].id,
        text="Hey Arjun! Saw your profile for the 3BHK in HSR Sector 2. The location is just 10 mins from Razorpay's office.",
        is_icebreaker=False
    )
    m2 = Message(
        conversation_id=c1.id,
        sender_id=created_users[0].id,
        text="Hey Rohan! Yes, exactly. We have an attached bath for Bedroom 2. Also our AI compatibility scored 96%!",
        is_icebreaker=False
    )
    m3 = Message(
        conversation_id=c1.id,
        sender_id=created_users[1].id,
        text="Are you open to sharing a daily cook and maid for cleaning and cooking?",
        is_icebreaker=True
    )
    m4 = Message(
        conversation_id=c1.id,
        sender_id=created_users[0].id,
        text="100%! We already have Laxmi Akka who comes at 8:30 AM every morning and cooks amazing South & North meals.",
        is_icebreaker=False
    )
    db.add_all([m1, m2, m3, m4])

    # 5. SafeMeet Booking Sample
    safe_meet = SafeMeet(
        sender_id=created_users[1].id,
        receiver_id=created_users[0].id,
        cafe_name="Third Wave Coffee, HSR Sector 4",
        location_address="17th Cross Rd, Sector 4, HSR Layout",
        meetup_date="2026-11-15",
        meetup_time="17:30",
        status="Accepted",
        notes="Catch up over flat whites and finalize the room lease!"
    )
    db.add(safe_meet)

    # 6. Seed Admin User
    # In production, require explicit ADMIN_EMAIL and ADMIN_PASSWORD. Never seed hardcoded default passwords.
    is_prod = settings.ENVIRONMENT.lower() == "production"
    admin_email = settings.ADMIN_EMAIL if is_prod else (settings.ADMIN_EMAIL or "admin@roomsync.ai")
    admin_password = settings.ADMIN_PASSWORD if is_prod else (settings.ADMIN_PASSWORD or "adminpassword123")

    if is_prod and not (settings.ADMIN_EMAIL and settings.ADMIN_PASSWORD):
        print("PRODUCTION SECURITY NOTICE: Skipping default admin seeding. Set ADMIN_EMAIL and ADMIN_PASSWORD in environment.")
    else:
        admin_exists = db.query(User).filter(User.email == admin_email).first()
        if not admin_exists:
            admin_user = User(
                email=admin_email,
                hashed_password=get_password_hash(admin_password),
                full_name="RoomSync System Admin",
                phone="+91 99999 00001",
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.flush()

        p_admin = Profile(
            user_id=admin_user.id,
            age=32,
            gender="Other",
            occupation="Platform Superadmin",
            company="RoomSync HQ",
            city="Bengaluru",
            neighborhood="Indiranagar",
            bio="Superadmin account for RoomSync AI co-living platform moderation, safety audits, and KYC verification.",
            avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
            upi_id="admin@roomsync",
            budget_min=0,
            budget_max=100000,
            housing_status="Admin",
            target_move_in="N/A",
            sleep_schedule="Flexible",
            dietary_pref="All",
            non_veg_cooking_allowed="Yes",
            smoking="Never",
            drinking="Never",
            cleanliness=5,
            wfh_status="Hybrid",
            pet_friendly="Loves Pets",
            guest_policy="Flexible",
            cook_maid_pref="Flexible",
            interests="Security, Moderation, Trust & Safety"
        )
        db.add(p_admin)

        v_admin = Verification(
            user_id=admin_user.id,
            aadhaar_verified=True,
            aadhaar_masked="XXXXXXXX0000",
            pan_verified=True,
            pan_masked="ADMIN****X",
            work_email_verified=True,
            work_email="admin@roomsync.ai",
            company_name="RoomSync AI HQ",
            phone_verified=True,
            trust_score=100,
            verified_at=datetime.utcnow()
        )
        db.add(v_admin)

    db.commit()
    db.close()
    print("Database successfully seeded with realistic Indian startup co-living profiles!")

if __name__ == "__main__":
    seed_database()
