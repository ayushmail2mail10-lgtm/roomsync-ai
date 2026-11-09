import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            status_code = response.status
            resp_body = response.read().decode("utf-8")
            return status_code, json.loads(resp_body) if resp_body else {}
    except urllib.error.HTTPError as e:
        resp_body = e.read().decode("utf-8")
        try:
            err_data = json.loads(resp_body)
        except Exception:
            err_data = {"detail": resp_body}
        return e.code, err_data
    except Exception as e:
        return 0, {"error": str(e)}

def login(email, password="password123"):
    status, res = make_request("/auth/login", method="POST", data={"email": email, "password": password})
    assert status == 200, f"Login failed for {email}: {res}"
    return res["access_token"]

def run_tests():
    print("=" * 70)
    print("RoomSync AI -- Phase 4 Full Suite & Security Audit")
    print("=" * 70)

    # 1. Login all personas
    print("\n[TEST 1] Logging in demo personas...")
    rohan_token = login("rohan.verma@roomsync.ai")        # Tenant
    sneha_token = login("sneha.kulkarni@roomsync.ai")      # Property Owner
    arjun_token = login("arjun@roomsync.ai")              # Flat Owner
    admin_token = login("admin@roomsync.ai", "adminpassword123")  # Admin
    print("[PASS] All 4 role accounts authenticated successfully.")

    # 2. Existing Phase 1-3 features regression test
    print("\n[TEST 2] Verifying Phase 1-3 features (Matches, Expenses, Chat, Admin RBAC)...")
    st, data = make_request("/matches/explore", token=rohan_token)
    assert st == 200 and len(data) > 0, "Matches explore failed"

    st, data = make_request("/expenses/dashboard-summary", token=arjun_token)
    assert st == 200, "Expenses dashboard-summary failed"

    st, data = make_request("/chat/conversations", token=rohan_token)
    assert st == 200, "Chat conversations failed"

    st, data = make_request("/admin/metrics", token=rohan_token)
    assert st == 403, f"Tenant should be forbidden from admin metrics, got {st}"

    st, data = make_request("/admin/metrics", token=admin_token)
    assert st == 200, f"Admin metrics failed for superadmin: {st}"
    print("[PASS] Phases 1-3 core features regression passed.")

    # 3. Property Discovery & Search
    print("\n[TEST 3] Testing Property Discovery & Filtering...")
    st, props = make_request("/properties")
    assert st == 200 and len(props) >= 4, f"Expected at least 4 properties, got {len(props)}"
    
    # Filter by city
    st, b_props = make_request("/properties?city=Bengaluru")
    assert st == 200 and all(p["city"] == "Bengaluru" for p in b_props), "City filter failed"

    # Detail view
    first_id = props[0]["id"]
    st, prop_detail = make_request(f"/properties/{first_id}")
    assert st == 200 and prop_detail["owner"] is not None, "Property detail failed"
    print("[PASS] Property discovery, city filtering, and detail specifications passed.")

    # 4. Property Creation, Validation & Role RBAC
    print("\n[TEST 4] Testing Property Creation & Ownership Authorization...")
    # 4a. Tenant attempts to create property -> Expect 403
    st, res = make_request("/properties", method="POST", data={
        "title": "Unauthorized Tenant Apartment",
        "city": "Bengaluru",
        "neighborhood": "Koramangala",
        "monthly_rent": 30000,
        "deposit_amount": 90000,
        "property_type": "2 BHK",
        "total_bedrooms": 2,
        "available_bedrooms": 1,
        "furnishing_status": "Fully Furnished"
    }, token=rohan_token)
    assert st == 403, f"Tenant was not blocked from creating property! Got {st}"
    print("[PASS] Tenant prevented from creating property listings (403 Forbidden).")

    # 4b. Invalid property data (rent <= 0, available_bedrooms > total_bedrooms) -> Expect 422
    st, res = make_request("/properties", method="POST", data={
        "title": "Invalid Property",
        "city": "Bengaluru",
        "neighborhood": "Indiranagar",
        "monthly_rent": -500,
        "deposit_amount": 10000,
        "property_type": "1 BHK",
        "total_bedrooms": 1,
        "available_bedrooms": 5,
        "furnishing_status": "Fully Furnished"
    }, token=sneha_token)
    assert st == 422, f"Invalid property data should fail Pydantic validation (422), got {st}"
    print("[PASS] Invalid property data rejected by backend validation (422 Unprocessable Entity).")

    # 4c. Sneha creates valid property
    st, new_prop = make_request("/properties", method="POST", data={
        "title": "Brigade Metropolis - Modern 2 BHK",
        "description": "Premium 2 BHK near Garudacharpalya metro with private gym and covered parking.",
        "city": "Bengaluru",
        "neighborhood": "Mahadevapura",
        "property_type": "2 BHK Luxury Apartment",
        "total_bedrooms": 2,
        "available_bedrooms": 2,
        "monthly_rent": 38000,
        "deposit_amount": 120000,
        "furnishing_status": "Fully Furnished",
        "amenities": ["Swimming Pool", "Gym", "Power Backup"],
        "preferred_gender": "Any",
        "food_preference": "Flexible",
        "status": "active",
        "rooms": [
            {
                "title": "Master Bedroom with Balcony",
                "room_type": "Master Bedroom",
                "rent": 20000,
                "deposit": 60000,
                "is_vacant": True,
                "available_from": "Immediate"
            },
            {
                "title": "Guest Bedroom",
                "room_type": "Private Room",
                "rent": 18000,
                "deposit": 60000,
                "is_vacant": True,
                "available_from": "Immediate"
            }
        ]
    }, token=sneha_token)
    assert st == 201, f"Sneha failed to create property: {new_prop}"
    created_prop_id = new_prop["id"]
    room1_id = new_prop["rooms"][0]["id"]
    room2_id = new_prop["rooms"][1]["id"]
    print(f"[PASS] Sneha created property ID {created_prop_id} with 2 rooms.")

    # 4d. Arjun (another owner) tries to edit Sneha's property -> Expect 403
    st, res = make_request(f"/properties/{created_prop_id}", method="PUT", data={"title": "Hacked Title"}, token=arjun_token)
    assert st == 403, f"Arjun was not blocked from editing Sneha's property! Got {st}"
    print("[PASS] Cross-owner property modification blocked (403 Forbidden).")

    # 4e. Sneha updates her own property -> Expect 200
    st, res = make_request(f"/properties/{created_prop_id}", method="PUT", data={"title": "Brigade Metropolis - Updated Title"}, token=sneha_token)
    assert st == 200 and res["title"] == "Brigade Metropolis - Updated Title", "Owner update failed"
    print("[PASS] Owner successfully updated own listing.")

    # 5. Applications, Privacy Isolation & Duplicate Prevention
    print("\n[TEST 5] Testing Applications, Privacy Isolation & Duplicate Guards...")
    # 5a. Sneha tries to apply to her own property -> Expect 400
    st, res = make_request(f"/applications/properties/{created_prop_id}/apply", method="POST", data={"room_id": room1_id}, token=sneha_token)
    assert st == 400, f"Owner was allowed to apply to own property! Got {st}"
    print("[PASS] Owner prevented from applying to own property (400 Bad Request).")

    # 5b. Rohan applies for room 1 -> Expect 201
    st, app1 = make_request(f"/applications/properties/{created_prop_id}/apply", method="POST", data={
        "room_id": room1_id,
        "message": "Hi Sneha, looking for immediate move-in.",
        "move_in_date": "2026-12-01",
        "proposed_budget": 20000
    }, token=rohan_token)
    assert st == 201, f"Tenant application failed: {app1}"
    app1_id = app1["id"]
    print(f"[PASS] Tenant submitted application ID {app1_id}.")

    # 5c. Duplicate application attempt for same room -> Expect 400
    st, res = make_request(f"/applications/properties/{created_prop_id}/apply", method="POST", data={
        "room_id": room1_id,
        "message": "Duplicate submission test"
    }, token=rohan_token)
    assert st == 400, f"Duplicate application was allowed! Got {st}"
    print("[PASS] Duplicate active application blocked (400 Bad Request).")

    # 5d. Tenant checks my-applications -> sees app1
    st, my_apps = make_request("/applications/my-applications", token=rohan_token)
    assert st == 200 and any(a["id"] == app1_id for a in my_apps), "Tenant application not found in my-applications"
    print("[PASS] Tenant views own applications.")

    # 5e. Tenant attempts to access incoming applications -> Expect 403
    st, res = make_request("/applications/incoming", token=rohan_token)
    assert st == 403, f"Tenant accessed incoming applications! Got {st}"
    print("[PASS] Tenant restricted from landlord incoming applications endpoint (403 Forbidden).")

    # 5f. Sneha views incoming applications -> sees app1
    st, sneha_inbox = make_request("/applications/incoming", token=sneha_token)
    assert st == 200 and any(a["id"] == app1_id for a in sneha_inbox), "Sneha did not find incoming application"
    print("[PASS] Landlord isolated inbox displays received application.")

    # 6. Acceptance Decisions, Room Vacancy & Conflict Prevention
    print("\n[TEST 6] Testing Landlord Decisions, Vacancy Updates & Conflict Prevention...")
    # 6a. Arjun tries to decide on Sneha's application -> Expect 403
    st, res = make_request(f"/applications/{app1_id}/decision", method="POST", data={"decision": "accepted"}, token=arjun_token)
    assert st == 403, f"Non-owner was allowed to decide on application! Got {st}"
    print("[PASS] Unauthorized landlord decision blocked (403 Forbidden).")

    # 6b. Sneha accepts Rohan's application -> Expect 200
    st, dec_res = make_request(f"/applications/{app1_id}/decision", method="POST", data={"decision": "accepted"}, token=sneha_token)
    assert st == 200 and dec_res["status"] == "accepted", f"Decision failed: {dec_res}"

    # Check property available bedrooms is decremented from 2 to 1
    st, prop_after = make_request(f"/properties/{created_prop_id}")
    assert prop_after["available_bedrooms"] == 1, f"Available bedrooms should be 1, got {prop_after['available_bedrooms']}"
    # Check room 1 is now marked occupied (is_vacant=False)
    r1 = next(r for r in prop_after["rooms"] if r["id"] == room1_id)
    assert r1["is_vacant"] is False, "Room 1 should be occupied after acceptance"
    print("[PASS] Application accepted, available bedrooms decremented, room marked occupied.")

    # 6c. Now another user (Arjun Mehta as room seeker) tries to apply for room 1 which is occupied -> Expect 400
    st, res = make_request(f"/applications/properties/{created_prop_id}/apply", method="POST", data={"room_id": room1_id}, token=arjun_token)
    assert st == 400, f"Applying to occupied room should fail with 400! Got {st}"
    print("[PASS] Application to occupied room rejected (400 Bad Request).")

    # 7. Safe Archiving
    print("\n[TEST 7] Testing Non-destructive Property Archiving...")
    st, res = make_request(f"/properties/{created_prop_id}", method="DELETE", token=sneha_token)
    assert st == 200 and res["status"] == "success", f"Archive failed: {res}"

    # Verify property is excluded from public search
    st, public_props = make_request("/properties")
    assert not any(p["id"] == created_prop_id for p in public_props), "Archived property still in public search"

    # Verify history is preserved for tenant
    st, rohan_apps = make_request("/applications/my-applications", token=rohan_token)
    assert any(a["id"] == app1_id for a in rohan_apps), "Application history lost after archiving property"
    print("[PASS] Property archived safely; history preserved in database.")

    print("\n" + "=" * 70)
    print("ALL 16 PHASE 4 SECURITY & BUSINESS LOGIC ASSERTIONS PASSED!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
