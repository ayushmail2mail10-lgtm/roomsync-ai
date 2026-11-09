"""
Unit and Integration Tests for Property Listings, Vacant Rooms, and Application Lifecycle.
"""
import pytest
from app.models.property import PropertyListing, RoomListing, PropertyApplication


def create_sample_property_payload():
    return {
        "title": "Sunlit 3BHK in HSR Sector 2",
        "description": "Spacious flat with high-speed WiFi, modular kitchen, and power backup.",
        "city": "Bengaluru",
        "neighborhood": "HSR Layout Sector 2",
        "address": "12th Main Road, Sector 2",
        "property_type": "3 BHK Apartment",
        "total_bedrooms": 3,
        "available_bedrooms": 2,
        "monthly_rent": 45000,
        "deposit_amount": 90000,
        "furnishing_status": "Semi Furnished",
        "amenities": ["WiFi", "Power Backup", "Washing Machine"],
        "image_urls": ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"],
        "preferred_gender": "Any",
        "food_preference": "Flexible",
        "rules": ["No loud music after 11 PM"],
        "status": "active",
        "rooms": [
            {
                "title": "Master Bedroom with Attached Washroom",
                "room_type": "Private Room",
                "rent": 18000,
                "deposit": 36000,
                "is_vacant": True,
                "available_from": "Immediate",
                "furnishing": "Semi Furnished",
                "amenities": ["Attached Bath", "Balcony"]
            },
            {
                "title": "Standard Bedroom with Garden View",
                "room_type": "Private Room",
                "rent": 15000,
                "deposit": 30000,
                "is_vacant": True,
                "available_from": "Immediate",
                "furnishing": "Semi Furnished",
                "amenities": ["Cupboard"]
            }
        ]
    }


class TestPropertyManagement:
    def test_property_owner_can_create_listing(self, client, auth_headers):
        payload = create_sample_property_payload()
        res = client.post("/api/properties", json=payload, headers=auth_headers["property_owner"])
        assert res.status_code == 201
        data = res.json()
        assert data["title"] == payload["title"]
        assert data["city"] == "Bengaluru"
        assert len(data["rooms"]) == 2

    def test_flat_owner_can_create_listing(self, client, auth_headers):
        payload = create_sample_property_payload()
        payload["title"] = "Shared 2BHK Room in Indiranagar"
        res = client.post("/api/properties", json=payload, headers=auth_headers["flat_owner"])
        assert res.status_code == 201
        assert res.json()["title"] == "Shared 2BHK Room in Indiranagar"

    def test_tenant_cannot_create_property_listing(self, client, auth_headers):
        payload = create_sample_property_payload()
        res = client.post("/api/properties", json=payload, headers=auth_headers["tenant1"])
        assert res.status_code == 403
        assert "Access forbidden" in res.json()["detail"]

    def test_validation_available_bedrooms_cannot_exceed_total(self, client, auth_headers):
        payload = create_sample_property_payload()
        payload["total_bedrooms"] = 2
        payload["available_bedrooms"] = 5  # Invalid
        res = client.post("/api/properties", json=payload, headers=auth_headers["property_owner"])
        assert res.status_code == 422

    def test_update_listing_ownership_check(self, client, auth_headers):
        # Create as property_owner
        res = client.post("/api/properties", json=create_sample_property_payload(), headers=auth_headers["property_owner"])
        prop_id = res.json()["id"]

        # Owner can update
        update_payload = {"monthly_rent": 48000, "description": "Updated rent and terms."}
        update_res = client.put(f"/api/properties/{prop_id}", json=update_payload, headers=auth_headers["property_owner"])
        assert update_res.status_code == 200
        assert update_res.json()["monthly_rent"] == 48000

        # Another user (flat_owner) cannot update
        unauth_res = client.put(f"/api/properties/{prop_id}", json=update_payload, headers=auth_headers["flat_owner"])
        assert unauth_res.status_code == 403
        assert "only update listings that you own" in unauth_res.json()["detail"]

    def test_soft_archiving_listing(self, client, auth_headers):
        res = client.post("/api/properties", json=create_sample_property_payload(), headers=auth_headers["property_owner"])
        prop_id = res.json()["id"]

        # Archive it
        del_res = client.delete(f"/api/properties/{prop_id}", headers=auth_headers["property_owner"])
        assert del_res.status_code == 200
        assert "has been archived" in del_res.json()["message"]

        # Excluded from public listing
        list_res = client.get("/api/properties")
        assert list_res.status_code == 200
        assert not any(p["id"] == prop_id for p in list_res.json())

        # Direct GET detail returns 404
        detail_res = client.get(f"/api/properties/{prop_id}")
        assert detail_res.status_code == 404

    def test_add_room_to_property(self, client, auth_headers):
        res = client.post("/api/properties", json=create_sample_property_payload(), headers=auth_headers["property_owner"])
        prop_id = res.json()["id"]

        room_payload = {
            "title": "Private Studio Annex",
            "room_type": "Studio",
            "rent": 22000,
            "deposit": 44000,
            "is_vacant": True,
            "available_from": "Immediate",
            "furnishing": "Fully Furnished",
            "amenities": ["Kitchenette", "AC"]
        }
        # Owner succeeds
        room_res = client.post(f"/api/properties/{prop_id}/rooms", json=room_payload, headers=auth_headers["property_owner"])
        assert room_res.status_code == 201
        assert room_res.json()["title"] == "Private Studio Annex"

        # Non-owner fails
        unauth_res = client.post(f"/api/properties/{prop_id}/rooms", json=room_payload, headers=auth_headers["flat_owner"])
        assert unauth_res.status_code == 403


class TestPropertySearchAndFiltering:
    def test_filter_properties_by_city_and_rent(self, client, auth_headers):
        p1 = create_sample_property_payload()
        p1["city"] = "Bengaluru"
        p1["monthly_rent"] = 30000
        client.post("/api/properties", json=p1, headers=auth_headers["property_owner"])

        p2 = create_sample_property_payload()
        p2["title"] = "Bandra Seaview Flat"
        p2["city"] = "Mumbai"
        p2["monthly_rent"] = 75000
        client.post("/api/properties", json=p2, headers=auth_headers["property_owner"])

        # Filter city Bengaluru
        res_blr = client.get("/api/properties?city=Bengaluru")
        assert res_blr.status_code == 200
        assert all("Bengaluru" in p["city"] for p in res_blr.json())

        # Filter max rent 40000
        res_rent = client.get("/api/properties?max_rent=40000")
        assert res_rent.status_code == 200
        assert all(p["monthly_rent"] <= 40000 for p in res_rent.json())


class TestApplicationsAndSecurity:
    def test_tenant_apply_and_owner_decision_flow(self, client, auth_headers):
        # 1. Owner creates property with rooms
        prop_res = client.post("/api/properties", json=create_sample_property_payload(), headers=auth_headers["property_owner"])
        prop = prop_res.json()
        prop_id = prop["id"]
        room_id = prop["rooms"][0]["id"]

        # 2. Tenant 1 applies to the room
        app_payload = {
            "room_id": room_id,
            "message": "Hi, I am a quiet software engineer looking to move in next week.",
            "move_in_date": "Next Monday",
            "proposed_budget": 18000
        }
        app_res = client.post(f"/api/applications/properties/{prop_id}/apply", json=app_payload, headers=auth_headers["tenant1"])
        assert app_res.status_code == 201
        app_data = app_res.json()
        assert app_data["status"] == "pending"
        app_id = app_data["id"]

        # 3. Owner cannot apply to own property
        own_apply = client.post(f"/api/applications/properties/{prop_id}/apply", json=app_payload, headers=auth_headers["property_owner"])
        assert own_apply.status_code == 400
        assert "Cannot apply to your own property" in own_apply.json()["detail"]

        # 4. Duplicate application rejected
        dup_apply = client.post(f"/api/applications/properties/{prop_id}/apply", json=app_payload, headers=auth_headers["tenant1"])
        assert dup_apply.status_code == 400
        assert "already have an active application" in dup_apply.json()["detail"]

        # 5. Tenant 2 also applies to same room (so we can test conflict resolution)
        app2_res = client.post(f"/api/applications/properties/{prop_id}/apply", json=app_payload, headers=auth_headers["tenant2"])
        assert app2_res.status_code == 201
        app2_id = app2_res.json()["id"]

        # 6. Check tenant privacy: Tenant 1 only sees Tenant 1's applications
        my_apps = client.get("/api/applications/my-applications", headers=auth_headers["tenant1"])
        assert my_apps.status_code == 200
        assert len(my_apps.json()) == 1
        assert my_apps.json()[0]["id"] == app_id

        # 7. Check landlord incoming: Owner sees both applications
        incoming = client.get(f"/api/applications/incoming?property_id={prop_id}", headers=auth_headers["property_owner"])
        assert incoming.status_code == 200
        assert len(incoming.json()) == 2

        # 8. Non-owner cannot make decision
        unauth_dec = client.post(f"/api/applications/{app_id}/decision", json={"decision": "accepted"}, headers=auth_headers["flat_owner"])
        assert unauth_dec.status_code == 403

        # 9. Owner accepts Tenant 1's application
        accept_res = client.post(f"/api/applications/{app_id}/decision", json={"decision": "accepted"}, headers=auth_headers["property_owner"])
        assert accept_res.status_code == 200
        assert accept_res.json()["status"] == "accepted"

        # 10. Verify conflicting application by Tenant 2 was automatically rejected!
        t2_apps = client.get("/api/applications/my-applications", headers=auth_headers["tenant2"])
        assert t2_apps.json()[0]["status"] == "rejected"

        # 11. Verify room is now marked not vacant
        updated_prop = client.get(f"/api/properties/{prop_id}").json()
        target_room = [r for r in updated_prop["rooms"] if r["id"] == room_id][0]
        assert target_room["is_vacant"] is False
        assert updated_prop["available_bedrooms"] == 1  # decremented from 2 to 1
