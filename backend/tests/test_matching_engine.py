"""
Unit and Integration Tests for AI Roommate Matching Engine & Synergy Calculations.
"""
import pytest
from app.models.profile import Profile
from app.models.user import User
from app.services.matching_engine import calculate_compatibility


def create_dummy_profile(**kwargs) -> Profile:
    defaults = {
        "budget_min": 15000,
        "budget_max": 25000,
        "dietary_pref": "Pure Veg",
        "non_veg_cooking_allowed": "Yes",
        "sleep_schedule": "Normal (8 AM - 12 AM)",
        "cleanliness": 4,
        "smoking": "Never",
        "drinking": "Socially",
        "guest_policy": "Weekend Guests Allowed",
        "city": "Bengaluru",
        "neighborhood": "HSR Layout"
    }
    defaults.update(kwargs)
    return Profile(**defaults)


class TestMatchingAlgorithmUnit:
    def test_perfect_matching_profiles_get_high_score(self):
        p1 = create_dummy_profile()
        p2 = create_dummy_profile()
        result = calculate_compatibility(p1, p2)

        assert result["overall_score"] >= 95
        assert result["budget_score"] == 100
        assert result["dietary_score"] == 100
        assert result["sleep_score"] == 100
        assert result["cleanliness_score"] == 100
        assert result["location_score"] == 100
        assert "Outstanding Synergy" in result["vibe_summary"]

    def test_budget_overlap_scenarios(self):
        # 1. Exact overlap
        p1 = create_dummy_profile(budget_min=10000, budget_max=20000)
        p2 = create_dummy_profile(budget_min=18000, budget_max=25000)
        res = calculate_compatibility(p1, p2)
        assert res["budget_score"] == 100

        # 2. Slight gap (<= 3000)
        p1 = create_dummy_profile(budget_min=10000, budget_max=15000)
        p2 = create_dummy_profile(budget_min=17000, budget_max=25000)  # Gap is 2000
        res = calculate_compatibility(p1, p2)
        assert res["budget_score"] == 75

        # 3. Noticeable gap (<= 6000)
        p1 = create_dummy_profile(budget_min=10000, budget_max=15000)
        p2 = create_dummy_profile(budget_min=20000, budget_max=30000)  # Gap is 5000
        res = calculate_compatibility(p1, p2)
        assert res["budget_score"] == 50

        # 4. Significant gap (> 6000)
        p1 = create_dummy_profile(budget_min=5000, budget_max=10000)
        p2 = create_dummy_profile(budget_min=25000, budget_max=40000)  # Gap is 15000
        res = calculate_compatibility(p1, p2)
        assert res["budget_score"] == 25

    def test_dietary_strict_veg_vs_non_veg(self):
        # Strict veg with no non-veg cooking allowed vs non-veg
        p1 = create_dummy_profile(dietary_pref="Pure Veg", non_veg_cooking_allowed="No")
        p2 = create_dummy_profile(dietary_pref="Non-Veg", non_veg_cooking_allowed="Yes")
        res = calculate_compatibility(p1, p2)
        assert res["dietary_score"] == 40
        assert any("pure vegetarian kitchen" in w for w in res["watchouts"])

        # Veg with non-veg cooking allowed vs non-veg
        p1_flexible = create_dummy_profile(dietary_pref="Pure Veg", non_veg_cooking_allowed="Yes")
        res_flex = calculate_compatibility(p1_flexible, p2)
        assert res_flex["dietary_score"] == 70

    def test_sleep_cycle_conflicts(self):
        p1 = create_dummy_profile(sleep_schedule="Night Owl (2 AM - 10 AM)")
        p2 = create_dummy_profile(sleep_schedule="Early Bird (5 AM - 9 PM)")
        res = calculate_compatibility(p1, p2)
        assert res["sleep_score"] == 45
        assert any("Early Bird vs. Night Owl" in w for w in res["watchouts"])

    def test_cleanliness_rating_deltas(self):
        # delta = 0 -> 100
        p1 = create_dummy_profile(cleanliness=5)
        p2 = create_dummy_profile(cleanliness=5)
        assert calculate_compatibility(p1, p2)["cleanliness_score"] == 100

        # delta = 1 -> 85
        p2 = create_dummy_profile(cleanliness=4)
        assert calculate_compatibility(p1, p2)["cleanliness_score"] == 85

        # delta = 2 -> 65
        p2 = create_dummy_profile(cleanliness=3)
        assert calculate_compatibility(p1, p2)["cleanliness_score"] == 65

        # delta >= 3 -> 35
        p2 = create_dummy_profile(cleanliness=1)
        assert calculate_compatibility(p1, p2)["cleanliness_score"] == 35

    def test_social_habits_and_guest_policies(self):
        # Non-smoker vs Regular smoker
        p1 = create_dummy_profile(smoking="Never", guest_policy="No Guests")
        p2 = create_dummy_profile(smoking="Regularly", guest_policy="Party Friendly")
        res = calculate_compatibility(p1, p2)
        assert res["social_score"] <= 50
        assert any("Conflicting smoking habits" in w for w in res["watchouts"])

    def test_location_proximity_tiers(self):
        # Same neighborhood & city -> 100
        p1 = create_dummy_profile(city="Bengaluru", neighborhood="Koramangala")
        p2 = create_dummy_profile(city="Bengaluru", neighborhood="Koramangala")
        assert calculate_compatibility(p1, p2)["location_score"] == 100

        # Same city, different neighborhood -> 75
        p2 = create_dummy_profile(city="Bengaluru", neighborhood="Whitefield")
        assert calculate_compatibility(p1, p2)["location_score"] == 75

        # Different city -> 25
        p2 = create_dummy_profile(city="Mumbai", neighborhood="Bandra")
        assert calculate_compatibility(p1, p2)["location_score"] == 25

    def test_missing_or_none_fields_handling(self):
        # Must not raise exceptions when fields are None or empty
        p1 = Profile(budget_min=None, budget_max=None, dietary_pref=None, sleep_schedule=None, cleanliness=None)
        p2 = Profile(budget_min=None, budget_max=None, dietary_pref=None, sleep_schedule=None, cleanliness=None)
        res = calculate_compatibility(p1, p2)
        assert isinstance(res["overall_score"], int)
        assert 0 <= res["overall_score"] <= 100


class TestMatchesAPIIntegration:
    def test_get_matches_explore(self, client, auth_headers):
        res = client.get("/api/matches/explore", headers=auth_headers["tenant1"])
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        if len(data) > 0:
            match = data[0]
            assert "compatibility" in match
            assert "full_name" in match
            assert "overall_score" in match["compatibility"]

    def test_get_match_breakdown(self, client, auth_headers, seed_test_users):
        target_id = seed_test_users["tenant2"].id
        res = client.get(f"/api/matches/{target_id}/compatibility", headers=auth_headers["tenant1"])
        assert res.status_code == 200
        data = res.json()
        assert "overall_score" in data
        assert "budget_score" in data
        assert "dietary_score" in data
        assert "vibe_summary" in data
