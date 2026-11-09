import sqlite3
import json
from datetime import datetime

def run_migration():
    print("Starting Phase 4 Property & Room Discovery Database Migration...")
    conn = sqlite3.connect("backend/roomsync.db")
    cursor = conn.cursor()

    # 1. Create properties table if not exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        city VARCHAR(100) NOT NULL,
        neighborhood VARCHAR(100) NOT NULL,
        address VARCHAR(255),
        property_type VARCHAR(100) NOT NULL,
        total_bedrooms INTEGER NOT NULL DEFAULT 1,
        available_bedrooms INTEGER NOT NULL DEFAULT 1,
        monthly_rent INTEGER NOT NULL,
        deposit_amount INTEGER NOT NULL,
        furnishing_status VARCHAR(50) NOT NULL DEFAULT 'Semi Furnished',
        amenities TEXT NOT NULL DEFAULT '[]',
        image_urls TEXT NOT NULL DEFAULT '[]',
        preferred_gender VARCHAR(50) NOT NULL DEFAULT 'Any',
        food_preference VARCHAR(50) NOT NULL DEFAULT 'Flexible',
        rules TEXT NOT NULL DEFAULT '[]',
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
    );
    """)

    # 2. Create rooms table if not exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        room_type VARCHAR(100) NOT NULL DEFAULT 'Private Room',
        rent INTEGER NOT NULL,
        deposit INTEGER NOT NULL,
        is_vacant BOOLEAN NOT NULL DEFAULT 1,
        available_from VARCHAR(100) NOT NULL DEFAULT 'Immediate',
        furnishing VARCHAR(255),
        amenities TEXT NOT NULL DEFAULT '[]',
        created_at DATETIME NOT NULL
    );
    """)

    # 3. Create property_applications table if not exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS property_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
        applicant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        message TEXT,
        move_in_date VARCHAR(100),
        proposed_budget INTEGER,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
    );
    """)

    # Indices
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_rooms_property_id ON rooms(property_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_prop_apps_prop_id ON property_applications(property_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_prop_apps_applicant_id ON property_applications(applicant_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_prop_apps_owner_id ON property_applications(owner_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_prop_apps_status ON property_applications(status);")

    conn.commit()

    # 4. Check if properties are already seeded
    cursor.execute("SELECT COUNT(*) FROM properties")
    count = cursor.fetchone()[0]

    now_iso = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    if count == 0:
        print("Seeding initial Phase 4 property listings and applications using existing demo accounts...")

        # Look up existing users by email
        cursor.execute("SELECT id, email FROM users WHERE email IN ('sneha.kulkarni@roomsync.ai', 'arjun@roomsync.ai', 'rohan.verma@roomsync.ai', 'ananya.sharma@roomsync.ai')")
        user_map = {row[1]: row[0] for row in cursor.fetchall()}
        print(f"Found existing user mappings: {user_map}")

        sneha_id = user_map.get("sneha.kulkarni@roomsync.ai")
        arjun_id = user_map.get("arjun@roomsync.ai")
        rohan_id = user_map.get("rohan.verma@roomsync.ai")
        ananya_id = user_map.get("ananya.sharma@roomsync.ai")

        if sneha_id:
            # Property 1: Prestige Silver Oak (Bengaluru)
            cursor.execute("""
            INSERT INTO properties (
                owner_id, title, description, city, neighborhood, address, property_type,
                total_bedrooms, available_bedrooms, monthly_rent, deposit_amount,
                furnishing_status, amenities, image_urls, preferred_gender, food_preference,
                rules, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                sneha_id,
                "Prestige Silver Oak - Luxury 3 BHK",
                "Spacious premium 3 BHK apartment located right on ITPL Main Road. Features Italian marble flooring, high-speed lift, 100% DG power backup, clubhouse access, swimming pool, and dedicated underground car parking.",
                "Bengaluru",
                "Whitefield / ITPL Main Rd",
                "Tower 4, Flat 702, Prestige Silver Oak, ECC Rd, Whitefield, Bengaluru",
                "3 BHK Luxury Apartment",
                3, 1, 45000, 150000,
                "Fully Furnished",
                json.dumps(["Swimming Pool", "Gym", "High-speed Wi-Fi", "100% Power Backup", "Covered Parking", "Cook Service", "Security 24/7", "Air Conditioning"]),
                json.dumps([
                    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
                ]),
                "Any",
                "Flexible",
                json.dumps(["Quiet hours after 11 PM", "No smoking inside bedrooms", "Visitors allowed on weekends"]),
                "active",
                now_iso, now_iso
            ))
            prop1_id = cursor.lastrowid

            # Add rooms for Property 1
            cursor.execute("""
            INSERT INTO rooms (property_id, title, room_type, rent, deposit, is_vacant, available_from, furnishing, amenities, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                prop1_id,
                "Master Bedroom with Balcony & Ensuite Western Bath",
                "Master Bedroom",
                18000, 50000, 1, "Immediate",
                "King Bed, Ergonomic Chair, Work Desk, 4-door Wardrobe, AC",
                json.dumps(["Attached Bath", "Private Balcony", "Air Conditioner", "High-speed Ethernet"]),
                now_iso
            ))
            room1_id = cursor.lastrowid

            cursor.execute("""
            INSERT INTO rooms (property_id, title, room_type, rent, deposit, is_vacant, available_from, furnishing, amenities, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                prop1_id,
                "Deluxe Bedroom with Garden View",
                "Private Room",
                14000, 50000, 0, "Occupied",
                "Queen Bed, Wardrobe, Study Table",
                json.dumps(["Garden View Window", "Ceiling Fan", "Wardrobe"]),
                now_iso
            ))

            cursor.execute("""
            INSERT INTO rooms (property_id, title, room_type, rent, deposit, is_vacant, available_from, furnishing, amenities, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                prop1_id,
                "Cozy Bedroom with Workstation",
                "Private Room",
                13000, 50000, 0, "Occupied",
                "Single Bed, Work Desk, Wardrobe",
                json.dumps(["High-speed Wi-Fi", "Bookshelf"]),
                now_iso
            ))

            # Property 2: Hiranandani Gardens (Mumbai)
            cursor.execute("""
            INSERT INTO properties (
                owner_id, title, description, city, neighborhood, address, property_type,
                total_bedrooms, available_bedrooms, monthly_rent, deposit_amount,
                furnishing_status, amenities, image_urls, preferred_gender, food_preference,
                rules, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                sneha_id,
                "Hiranandani Gardens - Regent Hill 2 BHK",
                "Scenic lake-view 2 BHK in the heart of Powai tech district. Perfect for corporate professionals working at Bain, McKinsey, L&T, or IIT Bombay.",
                "Mumbai",
                "Powai",
                "Wing B, Flat 1204, Regent Hill, Hiranandani Gardens, Powai, Mumbai",
                "2 BHK High-Rise",
                2, 0, 62000, 200000,
                "Semi Furnished",
                json.dumps(["Clubhouse", "Lake View Balcony", "Piped Gas", "Security 24/7", "Gym", "Power Backup"]),
                json.dumps([
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                ]),
                "Working Professionals",
                "Vegetarian Preferred",
                json.dumps(["Pure veg kitchen preferred", "No late night loud parties"]),
                "occupied",
                now_iso, now_iso
            ))

            # Property 3: DLF Phase 5 The Crest (Gurgaon)
            cursor.execute("""
            INSERT INTO properties (
                owner_id, title, description, city, neighborhood, address, property_type,
                total_bedrooms, available_bedrooms, monthly_rent, deposit_amount,
                furnishing_status, amenities, image_urls, preferred_gender, food_preference,
                rules, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                sneha_id,
                "DLF Phase 5 - The Crest 3 BHK",
                "Ultra-luxury residence on Golf Course Road with concierge services, infinity swimming pool, and badminton courts. Seamless metro connectivity.",
                "Gurgaon",
                "Cyber City / Golf Course Rd",
                "Tower 2, Flat 1402, DLF The Crest, Sector 54, Golf Course Rd, Gurgaon",
                "3 BHK Luxury Apartment",
                3, 2, 58000, 180000,
                "Fully Furnished",
                json.dumps(["Infinity Pool", "Clubhouse", "Concierge", "EV Charging", "Power Backup", "Covered Parking", "Modular Kitchen"]),
                json.dumps([
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
                ]),
                "Any",
                "Flexible",
                json.dumps(["Designated smoking balcony only", "Respect quiet hours on weekdays"]),
                "active",
                now_iso, now_iso
            ))
            prop3_id = cursor.lastrowid

            cursor.execute("""
            INSERT INTO rooms (property_id, title, room_type, rent, deposit, is_vacant, available_from, furnishing, amenities, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                prop3_id,
                "Executive Master Suite with Walk-In Closet",
                "Master Bedroom",
                25000, 80000, 1, "Immediate",
                "King Bed, Leather Recliner, Large Desk, AC",
                json.dumps(["Walk-in Closet", "Attached Bath", "Balcony View", "AC"]),
                now_iso
            ))

            cursor.execute("""
            INSERT INTO rooms (property_id, title, room_type, rent, deposit, is_vacant, available_from, furnishing, amenities, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                prop3_id,
                "Spacious Deluxe Bedroom with Golf View",
                "Private Room",
                20000, 60000, 1, "Immediate",
                "Queen Bed, Study Desk, Cupboard",
                json.dumps(["Golf View Window", "AC", "High-speed Wi-Fi"]),
                now_iso
            ))

        if arjun_id:
            # Property 4: Skyline Green (Arjun Mehta - Flat Owner)
            cursor.execute("""
            INSERT INTO properties (
                owner_id, title, description, city, neighborhood, address, property_type,
                total_bedrooms, available_bedrooms, monthly_rent, deposit_amount,
                furnishing_status, amenities, image_urls, preferred_gender, food_preference,
                rules, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                arjun_id,
                "Skyline Green 3 BHK Shared Flat",
                "Modern high-rise flat in HSR Layout Sector 2, 5 mins from 27th Main food street and Cult.fit. Fully setup kitchen with cook & maid service.",
                "Bengaluru",
                "HSR Layout Sector 2",
                "Flat 402, Skyline Green, 14th Main, HSR Layout Sector 2, Bengaluru",
                "3 BHK High-Rise Flat",
                3, 1, 54000, 150000,
                "Fully Furnished",
                json.dumps(["High-speed Wi-Fi", "Cook & Maid Setup", "RO Water Purifier", "Washing Machine", "Power Backup", "Balcony", "Parking"]),
                json.dumps([
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
                ]),
                "Any",
                "Pure Veg",
                json.dumps(["Quiet hours after 11:30 PM", "Shared kitchen hygiene is strictly maintained", "No smoking inside flat"]),
                "active",
                now_iso, now_iso
            ))
            prop4_id = cursor.lastrowid

            cursor.execute("""
            INSERT INTO rooms (property_id, title, room_type, rent, deposit, is_vacant, available_from, furnishing, amenities, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                prop4_id,
                "Private Master Bedroom with Attached Balcony & Western Bath",
                "Master Bedroom",
                18000, 50000, 1, "Immediate",
                "Queen Bed, Large Wardrobe, AC, Ergonomic Work Desk & Chair",
                json.dumps(["Attached Bath", "Private Balcony", "AC", "Wi-Fi Router in room"]),
                now_iso
            ))
            room4_id = cursor.lastrowid

        # Seed realistic initial applications
        if rohan_id and arjun_id and 'prop4_id' in locals():
            cursor.execute("""
            INSERT INTO property_applications (
                property_id, room_id, applicant_id, owner_id, status, message, move_in_date, proposed_budget, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                prop4_id, room4_id, rohan_id, arjun_id, "pending",
                "Hey Arjun, I work as a Backend Platform Engineer at Razorpay. Non-smoker, clean habits, and hybrid work schedule. Looking for immediate move-in.",
                "2026-12-01", 20000, now_iso, now_iso
            ))

        if ananya_id and sneha_id and 'prop1_id' in locals():
            cursor.execute("""
            INSERT INTO property_applications (
                property_id, room_id, applicant_id, owner_id, status, message, move_in_date, proposed_budget, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                prop1_id, room1_id, ananya_id, sneha_id, "pending",
                "Hi Sneha, I'm a Product Designer at CRED. Love quiet, well-maintained spaces with lots of natural light. Very punctual with rent.",
                "2026-11-20", 22000, now_iso, now_iso
            ))

        conn.commit()
        print("Migration and initial Phase 4 seeding completed successfully!")
    else:
        print(f"Properties table already exists with {count} records. Migration structure verified without data modification.")

    conn.close()

if __name__ == "__main__":
    run_migration()
