"""
Authentication and Role-Based Access Control verification test.
Executes against an in-process isolated test database session.
Zero external network calls; zero modification to production database.
"""
import pytest


def test_auth_roles(client, seed_test_users):
    """
    Validates end-to-end authentication, role isolation, and role tampering prevention.
    """
    # 1. Login as Admin
    res = client.post("/api/auth/login", json={"email": "admin@roomsync.ai", "password": "adminpassword123"})
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    admin_data = res.json()
    assert admin_data.get("role") == "admin"
    admin_token = admin_data["access_token"]

    # 2. Get Admin Metrics with Admin Token
    res = client.get("/api/admin/metrics", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200, f"Admin metrics failed: {res.text}"
    metrics = res.json()
    assert "total_users" in metrics
    assert metrics["admins_count"] >= 1

    # 3. Login as Arjun (flat_owner)
    res = client.post("/api/auth/login", json={"email": "arjun@roomsync.ai", "password": "password123"})
    assert res.status_code == 200, f"Arjun login failed: {res.text}"
    arjun_data = res.json()
    assert arjun_data.get("role") == "flat_owner"
    arjun_token = arjun_data["access_token"]

    # 4. Attempt to access admin metrics with Arjun's token (must return 403 Forbidden)
    res = client.get("/api/admin/metrics", headers={"Authorization": f"Bearer {arjun_token}"})
    assert res.status_code == 403, f"Security violation: non-admin received status {res.status_code}"

    # 5. Check user info for both via /me
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert res.json()["email"] == "admin@roomsync.ai"
    assert res.json()["role"] == "admin"

    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {arjun_token}"})
    assert res.status_code == 200
    assert res.json()["email"] == "arjun@roomsync.ai"
    assert res.json()["role"] == "flat_owner"

    # 6. Test public registration role tampering (maliciously requesting admin role)
    reg_payload = {
        "email": "hacker@test.com",
        "password": "password123",
        "full_name": "Attacker Bob",
        "role": "admin"  # Maliciously requesting admin
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 200, f"Registration failed: {res.text}"
    hacker_data = res.json()
    assert hacker_data.get("role") != "admin", "Critical Security Flaw: Public registration granted admin role!"
    assert hacker_data.get("role") == "tenant", f"Expected default fallback to tenant, got {hacker_data.get('role')}"


# Backward compatibility for direct pytest execution of test()
def test(client, seed_test_users):
    test_auth_roles(client, seed_test_users)


if __name__ == "__main__":
    pytest.main(["-v", __file__])
