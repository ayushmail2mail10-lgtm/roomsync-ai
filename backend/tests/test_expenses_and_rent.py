"""
Unit and Integration Tests for Rent Calculations, Expense Splitting, and UPI QR Payments.
"""
import pytest
from app.services.upi_service import generate_upi_uri, generate_mock_qr_svg
from app.models.expense import FlatGroup, FlatMember


class TestUpiServiceUnit:
    def test_generate_upi_uri_format(self):
        uri = generate_upi_uri(
            payee_upi="arjun.mehta@oksbi",
            payee_name="Arjun Mehta",
            amount=16500.0,
            note="November Rent Share"
        )
        assert uri.startswith("upi://pay?")
        assert "pa=arjun.mehta%40oksbi" in uri
        assert "pn=Arjun+Mehta" in uri
        assert "am=16500.00" in uri
        assert "cu=INR" in uri
        assert "tn=November+Rent+Share" in uri

    def test_generate_mock_qr_svg_content(self):
        uri = generate_upi_uri("sneha@icici", "Sneha Kulkarni", 25000.0)
        svg = generate_mock_qr_svg(uri, "Sneha Kulkarni", 25000.0)
        assert svg.startswith("<svg")
        assert svg.strip().endswith("</svg>")
        assert "BHIM UPI" in svg
        assert "25,000" in svg
        assert "#00f59b" in svg


class TestExpensesAPIIntegration:
    def test_create_and_list_flat_groups(self, client, auth_headers):
        # 1. Create a Flat Group
        group_payload = {
            "name": "Koramangala Tech Flat",
            "address": "45, 80ft Road, 4th Block",
            "city": "Bengaluru",
            "total_rent": 48000.0
        }
        res = client.post("/api/expenses/groups", json=group_payload, headers=auth_headers["flat_owner"])
        assert res.status_code == 200
        group_data = res.json()
        assert group_data["name"] == "Koramangala Tech Flat"
        assert group_data["total_rent"] == 48000.0
        assert len(group_data["members"]) == 1
        assert group_data["members"][0]["monthly_rent_share"] == 24000.0  # 50% share default

        # 2. List Groups for User
        res_list = client.get("/api/expenses/groups", headers=auth_headers["flat_owner"])
        assert res_list.status_code == 200
        groups = res_list.json()
        assert any(g["id"] == group_data["id"] for g in groups)

    def test_shared_expense_equal_split_calculation(self, client, auth_headers, db_session, seed_test_users):
        # Create group and add a second flatmate
        group = FlatGroup(name="Indiranagar 2BHK", address="100ft Rd", city="Bengaluru", total_rent=40000.0)
        db_session.add(group)
        db_session.commit()
        db_session.refresh(group)

        m1 = FlatMember(group_id=group.id, user_id=seed_test_users["flat_owner"].id, room_label="Master Bedroom", monthly_rent_share=20000.0)
        m2 = FlatMember(group_id=group.id, user_id=seed_test_users["tenant1"].id, room_label="Second Bedroom", monthly_rent_share=20000.0)
        db_session.add_all([m1, m2])
        db_session.commit()

        # Add shared WiFi & Grocery expense of ₹3,000 paid by flat_owner
        expense_payload = {
            "group_id": group.id,
            "title": "Airtel Fiber & Groceries",
            "category": "Utilities",
            "total_amount": 3000.0,
            "split_type": "equal"
        }
        res = client.post(f"/api/expenses/groups/{group.id}/expenses", json=expense_payload, headers=auth_headers["flat_owner"])
        assert res.status_code == 200
        exp_data = res.json()
        assert exp_data["total_amount"] == 3000.0
        assert len(exp_data["splits"]) == 2

        # Each person owes ₹1,500
        for split in exp_data["splits"]:
            assert split["amount_owed"] == 1500.0
            if split["user_id"] == seed_test_users["flat_owner"].id:
                # Payer is marked paid
                assert split["is_paid"] is True
            else:
                # Other flatmate owes money
                assert split["is_paid"] is False

    def test_custom_unequal_split_expense(self, client, auth_headers, db_session, seed_test_users):
        group = FlatGroup(name="HSR 3BHK", address="Sector 2", city="Bengaluru", total_rent=60000.0)
        db_session.add(group)
        db_session.commit()

        u1 = seed_test_users["flat_owner"]
        u2 = seed_test_users["tenant1"]
        m1 = FlatMember(group_id=group.id, user_id=u1.id, room_label="Master", monthly_rent_share=30000.0)
        m2 = FlatMember(group_id=group.id, user_id=u2.id, room_label="Guest", monthly_rent_share=30000.0)
        db_session.add_all([m1, m2])
        db_session.commit()

        # Custom split: total 1000, flat_owner pays 700, tenant1 pays 300
        expense_payload = {
            "group_id": group.id,
            "title": "Maid & Cook Diwali Bonus",
            "category": "Household",
            "total_amount": 1000.0,
            "split_type": "custom",
            "splits": [
                {"user_id": u1.id, "amount_owed": 700.0},
                {"user_id": u2.id, "amount_owed": 300.0}
            ]
        }
        res = client.post(f"/api/expenses/groups/{group.id}/expenses", json=expense_payload, headers=auth_headers["flat_owner"])
        assert res.status_code == 200
        splits = res.json()["splits"]
        owed_map = {s["user_id"]: s["amount_owed"] for s in splits}
        assert owed_map[u1.id] == 700.0
        assert owed_map[u2.id] == 300.0

    def test_mark_split_paid(self, client, auth_headers, db_session, seed_test_users):
        group = FlatGroup(name="Quick Flat", address="MG Road", city="Bengaluru", total_rent=30000.0)
        db_session.add(group)
        db_session.commit()

        u1 = seed_test_users["flat_owner"]
        u2 = seed_test_users["tenant1"]
        m1 = FlatMember(group_id=group.id, user_id=u1.id, room_label="M", monthly_rent_share=15000.0)
        m2 = FlatMember(group_id=group.id, user_id=u2.id, room_label="S", monthly_rent_share=15000.0)
        db_session.add_all([m1, m2])
        db_session.commit()

        # Create expense
        res = client.post(f"/api/expenses/groups/{group.id}/expenses", json={
            "group_id": group.id,
            "title": "Electricity Bill",
            "category": "Utilities",
            "total_amount": 2000.0,
            "split_type": "equal"
        }, headers=auth_headers["flat_owner"])
        assert res.status_code == 200
        exp = res.json()
        unpaid_split = [s for s in exp["splits"] if not s["is_paid"]][0]

        # Tenant marks it paid via UPI
        pay_res = client.post(
            f"/api/expenses/splits/{unpaid_split['id']}/pay?upi_ref=UPI-HDFC-987654",
            headers=auth_headers["tenant1"]
        )
        assert pay_res.status_code == 200
        assert pay_res.json()["message"] == "Payment recorded successfully"
        assert pay_res.json()["upi_ref"] == "UPI-HDFC-987654"

    def test_dashboard_summary_and_net_balance(self, client, auth_headers, db_session, seed_test_users):
        u1 = seed_test_users["flat_owner"]
        u2 = seed_test_users["tenant1"]

        group = FlatGroup(name="Balance Nest", address="HSR", city="Bengaluru", total_rent=40000.0)
        db_session.add(group)
        db_session.commit()

        m1 = FlatMember(group_id=group.id, user_id=u1.id, room_label="M", monthly_rent_share=20000.0)
        m2 = FlatMember(group_id=group.id, user_id=u2.id, room_label="S", monthly_rent_share=20000.0)
        db_session.add_all([m1, m2])
        db_session.commit()

        # u1 pays 4000 (u2 owes 2000)
        res_exp = client.post(f"/api/expenses/groups/{group.id}/expenses", json={
            "group_id": group.id,
            "title": "Groceries",
            "category": "Groceries",
            "total_amount": 4000.0,
            "split_type": "equal"
        }, headers=auth_headers["flat_owner"])
        assert res_exp.status_code == 200

        # Check u1 (flat_owner) dashboard summary
        res1 = client.get("/api/expenses/dashboard-summary", headers=auth_headers["flat_owner"])
        assert res1.status_code == 200
        sum1 = res1.json()
        assert sum1["owed_to_me"] == 2000.0
        assert sum1["pending_to_pay"] == 0.0
        assert sum1["net_balance"] == 2000.0
        assert sum1["monthly_rent_share"] == 20000.0

        # Check u2 (tenant1) dashboard summary
        res2 = client.get("/api/expenses/dashboard-summary", headers=auth_headers["tenant1"])
        assert res2.status_code == 200
        sum2 = res2.json()
        assert sum2["owed_to_me"] == 0.0
        assert sum2["pending_to_pay"] == 2000.0
        assert sum2["net_balance"] == -2000.0

    def test_generate_upi_qr_endpoint(self, client):
        req = {
            "payee_upi": "owner@oksbi",
            "payee_name": "Property Owner",
            "amount": 18000.0,
            "note": "Rent Advance"
        }
        res = client.post("/api/expenses/upi-qr", json=req)
        assert res.status_code == 200
        data = res.json()
        assert "upi://" in data["upi_string"]
        assert "<svg" in data["qr_data_url"]
        assert data["amount"] == 18000.0
