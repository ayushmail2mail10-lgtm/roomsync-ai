from typing import Dict, Any, List
from ..models.profile import Profile

def calculate_compatibility(p1: Profile, p2: Profile) -> Dict[str, Any]:
    """
    Computes a comprehensive Indian lifestyle compatibility matrix between two roommate profiles.
    Returns individual scores (0-100), overall score (0-100), vibe summary, highlights, and watchouts.
    """
    highlights: List[str] = []
    watchouts: List[str] = []

    # 1. Budget Compatibility (Weight: 25%)
    # Overlap between [p1.budget_min, p1.budget_max] and [p2.budget_min, p2.budget_max]
    overlap_min = max(p1.budget_min or 10000, p2.budget_min or 10000)
    overlap_max = min(p1.budget_max or 25000, p2.budget_max or 25000)
    
    if overlap_max >= overlap_min:
        budget_score = 100
        highlights.append(f"Matching budget window (₹{overlap_min:,} - ₹{overlap_max:,}/mo)")
    else:
        diff = overlap_min - overlap_max
        if diff <= 3000:
            budget_score = 75
            watchouts.append(f"Slight budget gap (~₹{diff:,} difference)")
        elif diff <= 6000:
            budget_score = 50
            watchouts.append(f"Noticeable budget difference (~₹{diff:,})")
        else:
            budget_score = 25
            watchouts.append("Significant budget expectation gap")

    # 2. Dietary & Kitchen Harmony (Weight: 20%)
    diet1 = (p1.dietary_pref or "").lower()
    diet2 = (p2.dietary_pref or "").lower()
    cook_nv1 = (p1.non_veg_cooking_allowed or "Yes").lower()
    cook_nv2 = (p2.non_veg_cooking_allowed or "Yes").lower()

    if diet1 == diet2:
        dietary_score = 100
        highlights.append(f"Shared dietary preference: {p1.dietary_pref}")
    elif ("pure veg" in diet1 or "jain" in diet1) and ("non-veg" in diet2):
        if "no" in cook_nv1:
            dietary_score = 40
            watchouts.append(f"{p1.user.full_name if p1.user else 'User'} requires a pure vegetarian kitchen")
        else:
            dietary_score = 70
            watchouts.append("Different food habits; non-veg allowed with mutual respect")
    elif ("pure veg" in diet2 or "jain" in diet2) and ("non-veg" in diet1):
        if "no" in cook_nv2:
            dietary_score = 40
            watchouts.append(f"{p2.user.full_name if p2.user else 'Match'} prefers no non-veg cooking inside flat")
        else:
            dietary_score = 70
            watchouts.append("Non-veg and vegetarian balance; separate kitchen utensils recommended")
    else:
        dietary_score = 85

    # 3. Sleep & Work Schedule Alignment (Weight: 15%)
    sleep1 = (p1.sleep_schedule or "").lower()
    sleep2 = (p2.sleep_schedule or "").lower()

    if sleep1 == sleep2:
        sleep_score = 100
        highlights.append(f"Synchronized sleep rhythm: {p1.sleep_schedule}")
    elif ("night owl" in sleep1 and "early bird" in sleep2) or ("early bird" in sleep1 and "night owl" in sleep2):
        sleep_score = 45
        watchouts.append("Contrasting sleep cycles (Early Bird vs. Night Owl / US Shift)")
    else:
        sleep_score = 80
        highlights.append("Compatible daily routines")

    # 4. Cleanliness & Hygiene Expectations (Weight: 15%)
    c1 = p1.cleanliness or 4
    c2 = p2.cleanliness or 4
    clean_diff = abs(c1 - c2)
    
    if clean_diff == 0:
        cleanliness_score = 100
        highlights.append(f"Identical cleanliness standard ({c1}/5 rating)")
    elif clean_diff == 1:
        cleanliness_score = 85
        highlights.append("Close hygiene and cleanliness standards")
    elif clean_diff == 2:
        cleanliness_score = 65
        watchouts.append("Moderate difference in housekeeping expectations")
    else:
        cleanliness_score = 35
        watchouts.append("Large gap in cleanliness standards (potential friction point)")

    # 5. Social Vibe, Guest Policy & Habits (Weight: 15%)
    social_score = 85
    smoke1 = (p1.smoking or "Never").lower()
    smoke2 = (p2.smoking or "Never").lower()

    if smoke1 == smoke2:
        highlights.append(f"Aligned smoking preference: {p1.smoking}")
        social_score += 10
    elif ("never" in smoke1 and "regularly" in smoke2) or ("never" in smoke2 and "regularly" in smoke1):
        social_score -= 35
        watchouts.append("Conflicting smoking habits (Non-smoker vs Regular smoker)")
    elif "balcony" in smoke1 or "balcony" in smoke2:
        social_score -= 10
        highlights.append("Balcony smoking acceptable")

    drink1 = (p1.drinking or "Socially").lower()
    drink2 = (p2.drinking or "Socially").lower()
    if drink1 == drink2:
        social_score += 5

    guest1 = (p1.guest_policy or "").lower()
    guest2 = (p2.guest_policy or "").lower()
    if guest1 == guest2:
        highlights.append(f"Agreed guest policy: {p1.guest_policy}")
        social_score += 10
    elif "no guests" in guest1 and "party" in guest2:
        social_score -= 25
        watchouts.append("Different perspectives on hosting guests and parties")

    social_score = max(30, min(100, social_score))

    # 6. Location & Neighborhood Proximity (Weight: 10%)
    city1 = (p1.city or "").lower()
    city2 = (p2.city or "").lower()
    hood1 = (p1.neighborhood or "").lower()
    hood2 = (p2.neighborhood or "").lower()

    if city1 == city2:
        if hood1 == hood2:
            location_score = 100
            highlights.append(f"Targeting same locality ({p1.neighborhood}, {p1.city})")
        else:
            location_score = 75
            highlights.append(f"Same city ({p1.city})")
    else:
        location_score = 25
        watchouts.append(f"Different cities ({p1.city} vs {p2.city})")

    # Weighted Overall Score
    overall_score = int(
        (0.25 * budget_score) +
        (0.20 * dietary_score) +
        (0.15 * sleep_score) +
        (0.15 * cleanliness_score) +
        (0.15 * social_score) +
        (0.10 * location_score)
    )

    # Narrative Summary Generation
    if overall_score >= 90:
        vibe_summary = "Outstanding Synergy — High probability of seamless co-living with minimal friction."
    elif overall_score >= 80:
        vibe_summary = "Strong Compatibility — Solid alignment on core lifestyle pillars and rental budget."
    elif overall_score >= 65:
        vibe_summary = "Moderate Fit — Good potential, recommended to align on kitchen rules and guest policies during SafeMeet."
    else:
        vibe_summary = "Low Alignment — Differing habits; clear pre-move-in ground rules needed."

    return {
        "overall_score": overall_score,
        "budget_score": int(budget_score),
        "dietary_score": int(dietary_score),
        "sleep_score": int(sleep_score),
        "cleanliness_score": int(cleanliness_score),
        "social_score": int(social_score),
        "location_score": int(location_score),
        "vibe_summary": vibe_summary,
        "highlights": highlights[:4],
        "watchouts": watchouts[:3]
    }
