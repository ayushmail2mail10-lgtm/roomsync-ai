import urllib.request
import urllib.parse
import urllib.error
import json
import sqlite3
import os

BASE_URL = "http://127.0.0.1:8000"
DB_PATH = os.path.join(os.path.dirname(__file__), "roomsync.db")

def make_request(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        error_body = None
        try:
            error_body = json.loads(e.read().decode())
        except Exception:
            pass
        return e.code, error_body

def run_security_tests():
    print("=" * 75)
    print("ROOMSYNC AI - PHASE 3 BACKEND SECURITY TEST SUITE")
    print("=" * 75)
    passed_checks = []

    # 1. No authentication token -> 401 Unauthorized
    status, body = make_request("/api/admin/metrics", method="GET")
    assert status == 401, f"Expected 401 for unauthenticated /api/admin/metrics, got {status}"
    passed_checks.append("Unauthenticated request to /api/admin/metrics strictly returned 401 Unauthorized")

    status, body = make_request("/api/admin/users", method="GET")
    assert status == 401, f"Expected 401 for unauthenticated /api/admin/users, got {status}"
    passed_checks.append("Unauthenticated request to /api/admin/users strictly returned 401 Unauthorized")

    # 2. Login as Tenant (Rohan Verma)
    status, body = make_request("/api/auth/login", method="POST", data={"email": "rohan.verma@roomsync.ai", "password": "password123"})
    assert status == 200, f"Tenant login failed with status {status}"
    tenant_token = body["access_token"]
    assert body.get("role") == "tenant", f"Expected tenant role, got {body.get('role')}"

    # Tenant accessing /api/admin/* -> 403 Forbidden
    status, body = make_request("/api/admin/metrics", method="GET", token=tenant_token)
    assert status == 403, f"Expected 403 for tenant accessing /api/admin/metrics, got {status}"
    passed_checks.append("Tenant token accessing /api/admin/metrics strictly returned 403 Forbidden")

    status, body = make_request("/api/admin/users", method="GET", token=tenant_token)
    assert status == 403, f"Expected 403 for tenant accessing /api/admin/users, got {status}"
    passed_checks.append("Tenant token accessing /api/admin/users strictly returned 403 Forbidden")

    status, body = make_request("/api/admin/reports", method="GET", token=tenant_token)
    assert status == 403, f"Expected 403 for tenant accessing /api/admin/reports, got {status}"
    passed_checks.append("Tenant token accessing /api/admin/reports strictly returned 403 Forbidden")

    # 3. Login as Flat Owner (Arjun Mehta)
    status, body = make_request("/api/auth/login", method="POST", data={"email": "arjun@roomsync.ai", "password": "password123"})
    assert status == 200, f"Flat owner login failed with status {status}"
    flat_owner_token = body["access_token"]
    assert body.get("role") == "flat_owner"

    status, body = make_request("/api/admin/metrics", method="GET", token=flat_owner_token)
    assert status == 403, f"Expected 403 for flat owner accessing /api/admin/metrics, got {status}"
    passed_checks.append("Flat owner token accessing /api/admin/metrics strictly returned 403 Forbidden")

    # 4. Login as Property Owner (Sneha Kulkarni)
    status, body = make_request("/api/auth/login", method="POST", data={"email": "sneha.kulkarni@roomsync.ai", "password": "password123"})
    assert status == 200, f"Property owner login failed with status {status}"
    owner_token = body["access_token"]
    assert body.get("role") == "property_owner"

    status, body = make_request("/api/admin/metrics", method="GET", token=owner_token)
    assert status == 403, f"Expected 403 for property owner accessing /api/admin/metrics, got {status}"
    passed_checks.append("Property owner token accessing /api/admin/metrics strictly returned 403 Forbidden")

    # 5. Login as Administrator (RoomSync System Admin)
    status, body = make_request("/api/auth/login", method="POST", data={"email": "admin@roomsync.ai", "password": "adminpassword123"})
    assert status == 200, f"Admin login failed with status {status}"
    admin_token = body["access_token"]
    assert body.get("role") == "admin"

    status, metrics = make_request("/api/admin/metrics", method="GET", token=admin_token)
    assert status == 200, f"Admin /api/admin/metrics failed with status {status}"
    assert "total_users" in metrics and "admins_count" in metrics
    passed_checks.append(f"Admin token accessing /api/admin/metrics returned 200 OK (Platform Users: {metrics['total_users']})")

    status, users = make_request("/api/admin/users", method="GET", token=admin_token)
    assert status == 200, f"Admin /api/admin/users failed with status {status}"
    assert isinstance(users, list) and len(users) > 0
    passed_checks.append(f"Admin token accessing /api/admin/users returned 200 OK (Listed {len(users)} users)")

    status, reports = make_request("/api/admin/reports", method="GET", token=admin_token)
    assert status == 200, f"Admin /api/admin/reports failed with status {status}"
    passed_checks.append("Admin token accessing /api/admin/reports returned 200 OK")

    # 6. Public self-registration attempting role='admin'
    attacker_email = "malicious_reg_check_01@test.com"
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("DELETE FROM users WHERE email = ?", (attacker_email,))
    conn.commit()

    status, body = make_request("/api/auth/register", method="POST", data={
        "email": attacker_email,
        "password": "password123",
        "full_name": "Attacker Role Check",
        "role": "admin"  # Malicious self-assignment
    })
    assert status == 200, f"Registration failed with {status}"
    assert body.get("role") != "admin", f"SECURITY BREACH: Public registration created admin! {body.get('role')}"
    assert body.get("role") == "tenant", f"Expected 'tenant', got {body.get('role')}"

    # Verify directly in SQLite database
    cur.execute("SELECT role FROM users WHERE email = ?", (attacker_email,))
    db_role = cur.fetchone()[0]
    assert db_role == "tenant", f"Database role should be 'tenant', found '{db_role}'"
    conn.close()
    passed_checks.append("Public registration attempting role='admin' was coerced to 'tenant' in response and DB")

    # 7. Ordinary user attempting to modify own role via PUT /api/profiles/me
    status, body = make_request("/api/profiles/me", method="PUT", token=tenant_token, data={
        "role": "admin",
        "occupation": "Security Engineer"
    })
    assert status == 200, f"Profile update failed with {status}"

    # Verify user.role in GET /api/auth/me
    status, me_body = make_request("/api/auth/me", method="GET", token=tenant_token)
    assert status == 200
    assert me_body.get("role") == "tenant", f"SECURITY BREACH: User role changed to {me_body.get('role')}"

    # Verify user.role in database directly
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT role FROM users WHERE email = 'rohan.verma@roomsync.ai'")
    db_role_rohan = cur.fetchone()[0]
    assert db_role_rohan == "tenant", f"Database role changed to '{db_role_rohan}'"
    conn.close()
    passed_checks.append("Ordinary user cannot change database role via profile update (remains 'tenant')")

    print("\nALL BACKEND SECURITY CHECKS PASSED:")
    for i, check in enumerate(passed_checks, 1):
        print(f"  {i}. [PASS] {check}")
    print("=" * 75 + "\n")

if __name__ == "__main__":
    run_security_tests()
