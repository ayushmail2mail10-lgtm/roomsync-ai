"""
Unit and Integration Tests for Trust & Safety Verification, SafeMeets, and Admin Management.
"""
import pytest


class TestVerificationWorkflows:
    def test_aadhaar_verification_valid_and_masked(self, client, auth_headers):
        req = {
            "aadhaar_number": "9876 5432 1098",
            "otp": "123456"
        }
        res = client.post("/api/verification/verify-aadhaar", json=req, headers=auth_headers["tenant2"])
        assert res.status_code == 200
        data = res.json()
        assert data["aadhaar_verified"] is True
        assert data["aadhaar_masked"] == "XXXXXXXX1098"
        assert data["trust_score"] >= 75

    def test_aadhaar_invalid_length_rejected(self, client, auth_headers):
        req = {
            "aadhaar_number": "12345",  # Too short
            "otp": "123456"
        }
        res = client.post("/api/verification/verify-aadhaar", json=req, headers=auth_headers["tenant2"])
        assert res.status_code == 400
        assert "must be exactly 12 digits" in res.json()["detail"]

    def test_pan_verification_valid_and_masked(self, client, auth_headers):
        req = {
            "pan_number": "ABCDE1234F",
            "full_name": "Ananya Sharma"
        }
        res = client.post("/api/verification/verify-pan", json=req, headers=auth_headers["tenant2"])
        assert res.status_code == 200
        data = res.json()
        assert data["pan_verified"] is True
        assert data["pan_masked"] == "ABCDE****F"

    def test_pan_invalid_length_rejected(self, client, auth_headers):
        req = {
            "pan_number": "ABCD",
            "full_name": "Short Pan"
        }
        res = client.post("/api/verification/verify-pan", json=req, headers=auth_headers["tenant2"])
        assert res.status_code == 400
        assert "exactly 10 alphanumeric characters" in res.json()["detail"]

    def test_work_email_verification_corporate_domain(self, client, auth_headers):
        # Public domains rejected
        public_req = {"work_email": "ananya@gmail.com", "company_name": "Razorpay"}
        bad_res = client.post("/api/verification/verify-work-email", json=public_req, headers=auth_headers["tenant2"])
        assert bad_res.status_code == 400
        assert "corporate domain email" in bad_res.json()["detail"]

        # Corporate domain accepted
        corp_req = {"work_email": "ananya@razorpay.com", "company_name": "Razorpay"}
        ok_res = client.post("/api/verification/verify-work-email", json=corp_req, headers=auth_headers["tenant2"])
        assert ok_res.status_code == 200
        assert ok_res.json()["work_email_verified"] is True
        assert ok_res.json()["work_email"] == "ananya@razorpay.com"

    def test_safemeet_cafes_and_scheduling(self, client, auth_headers, seed_test_users):
        # 1. Get Cafes
        res_cafes = client.get("/api/verification/cafes")
        assert res_cafes.status_code == 200
        assert len(res_cafes.json()) >= 3

        # 2. Schedule SafeMeet
        target_id = seed_test_users["tenant1"].id
        meet_req = {
            "receiver_id": target_id,
            "cafe_name": "Third Wave Coffee",
            "location_address": "HSR Layout, Sector 4, Bengaluru",
            "meetup_date": "Tomorrow",
            "meetup_time": "5:30 PM",
            "notes": "Discussing room sharing ground rules."
        }
        res_meet = client.post("/api/verification/safe-meets", json=meet_req, headers=auth_headers["tenant2"])
        assert res_meet.status_code == 200
        assert res_meet.json()["status"] == "Pending"

        # 3. List my safe meets
        res_list = client.get("/api/verification/safe-meets", headers=auth_headers["tenant2"])
        assert res_list.status_code == 200
        assert len(res_list.json()) >= 1

    def test_report_or_block_user(self, client, auth_headers, seed_test_users):
        req = {
            "target_id": seed_test_users["tenant2"].id,
            "action_type": "report",
            "reason": "Spam / Misleading Information",
            "description": "User profile bio contains external promotional links."
        }
        res = client.post("/api/verification/report-block", json=req, headers=auth_headers["tenant1"])
        assert res.status_code == 200
        assert res.json()["status"] == "success"
        assert res.json()["action"] == "report"


class TestAdminManagement:
    def test_admin_metrics_queries(self, client, auth_headers):
        res = client.get("/api/admin/metrics", headers=auth_headers["admin"])
        assert res.status_code == 200
        data = res.json()
        assert data["total_users"] >= 5
        assert data["admins_count"] >= 1
        assert "system_status" in data

    def test_admin_users_moderation_list(self, client, auth_headers):
        res = client.get("/api/admin/users", headers=auth_headers["admin"])
        assert res.status_code == 200
        users = res.json()
        assert len(users) >= 5
        emails = [u["email"] for u in users]
        assert "admin@roomsync.ai" in emails
        assert "rohan.verma@roomsync.ai" in emails

    def test_admin_toggle_user_status(self, client, auth_headers, seed_test_users):
        target = seed_test_users["tenant1"]
        # Deactivate
        res = client.post(f"/api/admin/users/{target.id}/toggle-status", headers=auth_headers["admin"])
        assert res.status_code == 200
        assert res.json()["is_active"] is False

        # Attempting login as target should now be forbidden
        login_res = client.post("/api/auth/login", json={"email": target.email, "password": "password123"})
        assert login_res.status_code == 403

        # Re-activate
        res2 = client.post(f"/api/admin/users/{target.id}/toggle-status", headers=auth_headers["admin"])
        assert res2.status_code == 200
        assert res2.json()["is_active"] is True

    def test_admin_cannot_deactivate_own_account(self, client, auth_headers, seed_test_users):
        admin = seed_test_users["admin"]
        res = client.post(f"/api/admin/users/{admin.id}/toggle-status", headers=auth_headers["admin"])
        assert res.status_code == 400
        assert "Cannot deactivate your own administrator account" in res.json()["detail"]

    def test_admin_manual_verification_approval(self, client, auth_headers, seed_test_users):
        target = seed_test_users["tenant2"]  # Initially aadhaar_verified = False
        res = client.post(f"/api/admin/verifications/{target.id}/approve", headers=auth_headers["admin"])
        assert res.status_code == 200
        assert res.json()["aadhaar_verified"] is True
        assert "approved by administrator" in res.json()["message"]

    def test_admin_reports_audit_view(self, client, auth_headers, seed_test_users):
        # Create a report first
        client.post("/api/verification/report-block", json={
            "target_id": seed_test_users["tenant2"].id,
            "action_type": "report",
            "reason": "Suspicious listing activity"
        }, headers=auth_headers["tenant1"])

        # Admin views reports
        res = client.get("/api/admin/reports", headers=auth_headers["admin"])
        assert res.status_code == 200
        reports = res.json()
        assert len(reports) >= 1
        assert reports[0]["reason"] == "Suspicious listing activity"
