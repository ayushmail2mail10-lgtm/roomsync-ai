import pytest
import anyio
import httpx
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.models.profile import Profile
from app.models.verification import Verification
from app.models.expense import FlatGroup, FlatMember
from app.services.auth_utils import get_password_hash, create_access_token

# In-memory SQLite database using StaticPool so all connections share the same memory DB
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


class SyncASGIClient:
    """Synchronous in-process HTTP client wrapping httpx.AsyncClient + ASGITransport."""
    def __init__(self, asgi_app, base_url: str = "http://testserver"):
        self.asgi_app = asgi_app
        self.base_url = base_url

    def request(self, method: str, url: str, **kwargs):
        async def _call():
            async with httpx.AsyncClient(
                transport=httpx.ASGITransport(app=self.asgi_app),
                base_url=self.base_url
            ) as async_client:
                return await async_client.request(method, url, **kwargs)
        return anyio.run(_call)

    def get(self, url: str, **kwargs):
        return self.request("GET", url, **kwargs)

    def post(self, url: str, **kwargs):
        return self.request("POST", url, **kwargs)

    def put(self, url: str, **kwargs):
        return self.request("PUT", url, **kwargs)

    def delete(self, url: str, **kwargs):
        return self.request("DELETE", url, **kwargs)


@pytest.fixture(scope="function")
def db_session():
    """Provides a clean in-memory database session for each test function."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI test client with dependency override bound to the in-memory db_session."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    yield SyncASGIClient(app)
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def seed_test_users(db_session):
    """Seeds test personas into in-memory database."""
    # 1. Admin
    admin = User(
        email="admin@roomsync.ai",
        hashed_password=get_password_hash("adminpassword123"),
        full_name="Admin Officer",
        phone="+91 99999 00000",
        role="admin",
        is_active=True
    )
    db_session.add(admin)
    db_session.flush()

    ver_admin = Verification(user_id=admin.id, trust_score=100, aadhaar_verified=True, aadhaar_masked="XXXXXXXX9999")
    db_session.add(ver_admin)

    # 2. Flat Owner (Arjun)
    flat_owner = User(
        email="arjun@roomsync.ai",
        hashed_password=get_password_hash("password123"),
        full_name="Arjun Mehta",
        phone="+91 98765 43210",
        role="flat_owner",
        is_active=True
    )
    db_session.add(flat_owner)
    db_session.flush()

    prof_owner = Profile(
        user_id=flat_owner.id,
        age=26,
        gender="Male",
        occupation="Senior Frontend Engineer",
        company="Swiggy",
        city="Bengaluru",
        neighborhood="HSR Layout Sector 2",
        bio="Passionate about clean code and tidy flats.",
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
        guest_policy="Weekend Guests Allowed"
    )
    ver_owner = Verification(user_id=flat_owner.id, trust_score=85, aadhaar_verified=True, aadhaar_masked="XXXXXXXX4321")
    db_session.add(prof_owner)
    db_session.add(ver_owner)

    # 3. Property Owner (Sneha)
    prop_owner = User(
        email="sneha@roomsync.ai",
        hashed_password=get_password_hash("password123"),
        full_name="Sneha Kulkarni",
        phone="+91 98450 11223",
        role="property_owner",
        is_active=True
    )
    db_session.add(prop_owner)
    db_session.flush()

    prof_sneha = Profile(
        user_id=prop_owner.id,
        city="Bengaluru",
        neighborhood="Koramangala 4th Block",
        bio="Property owner offering modern managed co-living homes.",
        housing_status="Has Flat / Has Room",
        upi_id="sneha.prop@icici"
    )
    ver_sneha = Verification(user_id=prop_owner.id, trust_score=90, aadhaar_verified=True, aadhaar_masked="XXXXXXXX1122")
    db_session.add(prof_sneha)
    db_session.add(ver_sneha)

    # 4. Tenant 1 (Rohan)
    tenant1 = User(
        email="rohan.verma@roomsync.ai",
        hashed_password=get_password_hash("password123"),
        full_name="Rohan Verma",
        phone="+91 98111 22334",
        role="tenant",
        is_active=True
    )
    db_session.add(tenant1)
    db_session.flush()

    prof_rohan = Profile(
        user_id=tenant1.id,
        age=24,
        gender="Male",
        occupation="Data Analyst",
        company="Flipkart",
        city="Bengaluru",
        neighborhood="HSR Layout Sector 2",
        bio="Quiet, loves gaming and cooking.",
        upi_id="rohan.verma@okaxis",
        budget_min=14000,
        budget_max=22000,
        housing_status="Need Flat & Roommate",
        target_move_in="Immediate",
        sleep_schedule="Normal (8 AM - 12 AM)",
        dietary_pref="Pure Veg",
        non_veg_cooking_allowed="Yes",
        smoking="Never",
        drinking="Socially",
        cleanliness=4,
        wfh_status="Hybrid",
        guest_policy="Weekend Guests Allowed"
    )
    ver_rohan = Verification(user_id=tenant1.id, trust_score=80, aadhaar_verified=True, aadhaar_masked="XXXXXXXX2233")
    db_session.add(prof_rohan)
    db_session.add(ver_rohan)

    # 5. Tenant 2 (Ananya)
    tenant2 = User(
        email="ananya.sharma@roomsync.ai",
        hashed_password=get_password_hash("password123"),
        full_name="Ananya Sharma",
        phone="+91 99222 33445",
        role="tenant",
        is_active=True
    )
    db_session.add(tenant2)
    db_session.flush()

    prof_ananya = Profile(
        user_id=tenant2.id,
        age=25,
        gender="Female",
        occupation="Product Designer",
        company="Razorpay",
        city="Bengaluru",
        neighborhood="Indiranagar",
        bio="Product designer who loves plants, art, and coffee.",
        upi_id="ananya@paytm",
        budget_min=18000,
        budget_max=28000,
        housing_status="Need Flat & Roommate",
        target_move_in="Within 2 Weeks",
        sleep_schedule="Early Bird (6 AM - 10 PM)",
        dietary_pref="Vegetarian",
        non_veg_cooking_allowed="Yes",
        smoking="Never",
        drinking="Occasionally",
        cleanliness=5,
        wfh_status="Remote",
        guest_policy="Friends Welcome"
    )
    ver_ananya = Verification(user_id=tenant2.id, trust_score=75, aadhaar_verified=False)
    db_session.add(prof_ananya)
    db_session.add(ver_ananya)

    # 6. Inactive User
    inactive_user = User(
        email="inactive@roomsync.ai",
        hashed_password=get_password_hash("password123"),
        full_name="Deactivated User",
        phone="+91 98000 00000",
        role="tenant",
        is_active=False
    )
    db_session.add(inactive_user)

    db_session.commit()

    return {
        "admin": admin,
        "flat_owner": flat_owner,
        "property_owner": prop_owner,
        "tenant1": tenant1,
        "tenant2": tenant2,
        "inactive_user": inactive_user
    }


@pytest.fixture(scope="function")
def auth_headers(seed_test_users):
    """Provides a mapping of role -> auth header dict."""
    tokens = {}
    for role, user in seed_test_users.items():
        if user.is_active:
            token = create_access_token(data={"sub": user.email, "id": user.id, "role": user.role})
            tokens[role] = {"Authorization": f"Bearer {token}"}
    return tokens
