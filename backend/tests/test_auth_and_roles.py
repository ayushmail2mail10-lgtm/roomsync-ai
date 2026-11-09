"""
Unit and Integration Tests for Authentication, JWT handling, and Role-Based Access Control (RBAC).
"""
import pytest
from jose import jwt
from app.config import settings
from app.services.auth_utils import get_password_hash, verify_password, create_access_token


class TestPasswordUtils:
    def test_password_hashing_and_verification(self):
        password = "SecurePassword@2026"
        hashed = get_password_hash(password)
        assert hashed != password
        assert verify_password(password, hashed) is True
        assert verify_password("WrongPassword", hashed) is False

    def test_hash_is_salted(self):
        # Even with plain input, salted SHA-256 shouldn't match plain sha256
        import hashlib
        plain_sha = hashlib.sha256("test".encode()).hexdigest()
        assert get_password_hash("test") != plain_sha


class TestRegistrationAPI:
    def test_register_tenant_success(self, client, db_session):
        payload = {
            "email": "new.tenant@test.com",
            "password": "Password123!",
            "full_name": "New Tenant",
            "phone": "+91 91234 56789",
            "role": "tenant"
        }
        res = client.post("/api/auth/register", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["email"] == "new.tenant@test.com"
        assert data["role"] == "tenant"
        assert "access_token" in data

    def test_register_property_owner_success(self, client, db_session):
        payload = {
            "email": "landlord@test.com",
            "password": "Password123!",
            "full_name": "Landlord Sharma",
            "phone": "+91 98888 77777",
            "role": "property_owner"
        }
        res = client.post("/api/auth/register", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["role"] == "property_owner"

    def test_register_flat_owner_success(self, client, db_session):
        payload = {
            "email": "flatmate.owner@test.com",
            "password": "Password123!",
            "full_name": "Flat Owner Priya",
            "phone": "+91 97777 66666",
            "role": "flat_owner"
        }
        res = client.post("/api/auth/register", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["role"] == "flat_owner"

    def test_duplicate_email_registration_fails(self, client, seed_test_users):
        payload = {
            "email": "rohan.verma@roomsync.ai",  # Already seeded
            "password": "newpassword123",
            "full_name": "Imposter Rohan",
            "role": "tenant"
        }
        res = client.post("/api/auth/register", json=payload)
        assert res.status_code == 400
        assert "already exists" in res.json()["detail"]

    def test_public_admin_registration_sanitized_to_tenant(self, client, db_session):
        payload = {
            "email": "fakeadmin@test.com",
            "password": "Password123!",
            "full_name": "Fake Admin",
            "role": "admin"  # Maliciously requesting admin
        }
        res = client.post("/api/auth/register", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["role"] != "admin"
        assert data["role"] == "tenant"

    def test_invalid_role_defaults_to_tenant(self, client, db_session):
        payload = {
            "email": "customrole@test.com",
            "password": "Password123!",
            "full_name": "Custom Role User",
            "role": "super_god_mode"
        }
        res = client.post("/api/auth/register", json=payload)
        assert res.status_code == 200
        assert res.json()["role"] == "tenant"


class TestLoginAndJWT:
    def test_login_successful_returns_token(self, client, seed_test_users):
        res = client.post("/api/auth/login", json={
            "email": "rohan.verma@roomsync.ai",
            "password": "password123"
        })
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["email"] == "rohan.verma@roomsync.ai"
        assert data["role"] == "tenant"

        # Verify JWT claims
        decoded = jwt.decode(data["access_token"], settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert decoded["sub"] == "rohan.verma@roomsync.ai"
        assert decoded["role"] == "tenant"

    def test_login_wrong_password_fails(self, client, seed_test_users):
        res = client.post("/api/auth/login", json={
            "email": "rohan.verma@roomsync.ai",
            "password": "IncorrectPassword"
        })
        assert res.status_code == 401
        assert "Incorrect email or password" in res.json()["detail"]

    def test_login_nonexistent_email_fails(self, client, seed_test_users):
        res = client.post("/api/auth/login", json={
            "email": "nobody@roomsync.ai",
            "password": "password123"
        })
        assert res.status_code == 401
        assert "Incorrect email or password" in res.json()["detail"]

    def test_login_deactivated_account_blocked(self, client, seed_test_users):
        res = client.post("/api/auth/login", json={
            "email": "inactive@roomsync.ai",
            "password": "password123"
        })
        assert res.status_code == 403
        assert "deactivated" in res.json()["detail"]


class TestAuthMeAndRBAC:
    def test_get_me_with_valid_token(self, client, auth_headers):
        res = client.get("/api/auth/me", headers=auth_headers["tenant1"])
        assert res.status_code == 200
        data = res.json()
        assert data["email"] == "rohan.verma@roomsync.ai"
        assert data["role"] == "tenant"

    def test_get_me_without_token_returns_401(self, client, seed_test_users):
        res = client.get("/api/auth/me")
        assert res.status_code == 401

    def test_get_me_with_malformed_token_returns_401(self, client, seed_test_users):
        res = client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-valid-jwt"})
        assert res.status_code == 401

    def test_admin_route_strictly_requires_admin(self, client, auth_headers):
        # Admin permitted
        res = client.get("/api/admin/metrics", headers=auth_headers["admin"])
        assert res.status_code == 200

        # Tenant rejected
        res = client.get("/api/admin/metrics", headers=auth_headers["tenant1"])
        assert res.status_code == 403

        # Property owner rejected
        res = client.get("/api/admin/metrics", headers=auth_headers["property_owner"])
        assert res.status_code == 403

        # Flat owner rejected
        res = client.get("/api/admin/metrics", headers=auth_headers["flat_owner"])
        assert res.status_code == 403
