import sqlite3
import os
from app.services.auth_utils import get_password_hash

DB_PATH = os.path.join(os.path.dirname(__file__), "roomsync.db")

def migrate():
    print(f"Connecting to database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check if role column exists
    cursor.execute("PRAGMA table_info(users)")
    columns = [col[1] for col in cursor.fetchall()]
    print(f"Current columns in users: {columns}")

    if "role" not in columns:
        print("Adding 'role' column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'tenant'")
        conn.commit()
        print("Column 'role' added successfully.")
    else:
        print("'role' column already exists.")

    # Assign distinct roles to seed users
    role_updates = [
        ("arjun@roomsync.ai", "flat_owner"),
        ("sneha.kulkarni@roomsync.ai", "property_owner"),
        ("rohan.verma@roomsync.ai", "tenant"),
        ("ananya.sharma@roomsync.ai", "tenant"),
        ("aditi.nair@roomsync.ai", "tenant"),
        ("kabir.malhotra@roomsync.ai", "tenant"),
        ("vikram.iyer@roomsync.ai", "flat_owner"),
    ]

    for email, role in role_updates:
        cursor.execute("UPDATE users SET role = ? WHERE email = ?", (role, email))
    conn.commit()
    print("Updated roles for existing users.")

    # Check or insert admin user
    cursor.execute("SELECT id, email, role FROM users WHERE email = 'admin@roomsync.ai'")
    admin_row = cursor.fetchone()
    if not admin_row:
        print("Creating admin user 'admin@roomsync.ai'...")
        admin_pass_hash = get_password_hash("adminpassword123")
        cursor.execute("""
            INSERT INTO users (email, hashed_password, full_name, phone, role, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
        """, ("admin@roomsync.ai", admin_pass_hash, "RoomSync System Admin", "+91 99999 00001", "admin"))
        admin_id = cursor.lastrowid
        conn.commit()

        # Insert Admin Profile
        cursor.execute("""
            INSERT INTO profiles (
                user_id, age, gender, occupation, company, city, neighborhood,
                bio, avatar_url, upi_id, budget_min, budget_max, housing_status,
                target_move_in, sleep_schedule, dietary_pref, non_veg_cooking_allowed,
                smoking, drinking, cleanliness, wfh_status, pet_friendly,
                guest_policy, cook_maid_pref, interests
            ) VALUES (
                ?, 32, 'Other', 'Platform Superadmin', 'RoomSync HQ', 'Bengaluru', 'Indiranagar',
                'Superadmin account for RoomSync AI co-living platform moderation, safety audits, and KYC verification.',
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
                'admin@roomsync', 0, 100000, 'Admin',
                'N/A', 'Flexible', 'All', 'Yes',
                'Never', 'Never', 5, 'Hybrid', 'Loves Pets',
                'Flexible', 'Flexible', 'Security, Moderation, Trust & Safety'
            )
        """, (admin_id,))

        # Insert Admin Verification
        cursor.execute("""
            INSERT INTO verifications (
                user_id, aadhaar_verified, aadhaar_masked, pan_verified, pan_masked,
                work_email_verified, work_email, company_name, phone_verified,
                trust_score, verified_at
            ) VALUES (
                ?, 1, 'XXXXXXXX0000', 1, 'ADMIN****X',
                1, 'admin@roomsync.ai', 'RoomSync AI HQ', 1,
                100, datetime('now')
            )
        """, (admin_id,))
        conn.commit()
        print(f"Admin created with ID: {admin_id}")
    else:
        cursor.execute("UPDATE users SET role = 'admin' WHERE email = 'admin@roomsync.ai'")
        conn.commit()
        print("Admin user already present, ensured role='admin'.")

    # List all users and roles
    cursor.execute("SELECT id, email, full_name, role, is_active FROM users")
    users = cursor.fetchall()
    print("\nCurrent Database Users & Roles:")
    for u in users:
        print(f"ID {u[0]}: {u[1]} ({u[2]}) -> Role: {u[3]}, Active: {u[4]}")

    conn.close()
    print("Migration finished successfully.")

if __name__ == "__main__":
    migrate()
