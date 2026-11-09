# RoomSync AI 🚀
### Modern Indian Roommate Matching & Shared Rent Intelligence Platform

RoomSync AI is a full-stack Indian co-living platform engineered to resolve the chaotic, fragmented process of finding compatible flatmates, splitting rent fairly, and avoiding disputes in major urban tech centers like **Bengaluru (HSR Layout, Koramangala, Indiranagar, Bellandur)**, **Mumbai (Powai, Bandra)**, **Gurgaon (Cyber City, Golf Course Rd)**, and **Hyderabad (Hitec City, Gachibowli)**.

---

## 🌟 Key Features

1. **Smart AI Roommate Matching**:
   - Multi-factor compatibility algorithm evaluating 6 core lifestyle dimensions:
     - **Rental Budget Overlap** (25%)
     - **Dietary & Kitchen Harmony** (20% - Pure Veg, Eggetarian, Non-Veg, Jain cooking tolerance)
     - **Sleep Schedule & Work Rhythm** (15% - Night Owl / US Shift vs Early Bird, quiet hours)
     - **Cleanliness & Hygiene Standard** (15% - 1 to 5 scale, maid/cook sharing)
     - **Social Vibe & Guest Rules** (15% - Overnight guests, weekend visitors, smoking/drinking)
     - **Commute & Neighborhood Proximity** (10% - HSR Sector 2, Koramangala 4th Block, etc.)
   - Generates dynamic AI compatibility explanations and dimensional radar breakdown.

2. **Fair Rent Splitting & Utility Ledger**:
   - Master apartment rent calculation with multiple models:
     - **Room Premium Split** (Master bedroom with attached bath vs standard bedroom)
     - **Strict Equal Split**
   - Utility management: BESCOM electricity, Airtel Xstream / JioFiber broadband, Cook & Maid salary, and Blinkit groceries.
   - **Indian Unified Payments Interface (UPI) Integration**:
     - Dynamic NPCI-compliant UPI deep links (`upi://pay?pa=...&pn=...&am=...&cu=INR`)
     - Instant QR code generation for scanning via Google Pay, PhonePe, Paytm, or CRED.
     - One-click debt settlement and ledger balancing.

3. **DigiLocker Trust & Safety Framework**:
   - Instant simulated **Aadhaar Verification** with masked UIDAI format (`XXXXXXXX8921`)
   - **Income Tax PAN** validation (`AAAPM****M`)
   - Corporate employee work domain verification (`@swiggy.in`, `@razorpay.com`, `@cred.club`)
   - **SafeMeet Public Cafe Protocol**: Pre-move-in meeting scheduler at verified public coffee houses (Third Wave Coffee, Blue Tokai, Starbucks).
   - Report & Block system with safety audit logs.

4. **Pre-Move-In In-App Chat & Indian Icebreakers**:
   - In-app direct conversation channel between matched roommates.
   - Contextual Indian roommate icebreaker prompts:
     - *"Are you comfortable with non-veg cooking in the kitchen?"*
     - *"What are your ground rules for having weekend guests over?"*
     - *"Are you open to sharing a daily cook and maid for cleaning and cooking?"*
     - *"How do you prefer to handle high AC/electricity bills in peak summer?"*

5. **Modern Cyber Dark Startup UI**:
   - High-energy jet-black aesthetic (`#06080d`) with neon green (`#00f59b`), electric cyan (`#00f0ff`), and yellow (`#ffd600`) accents.
   - Interactive live compatibility simulator on the landing page.
   - Fully responsive, mobile-first design with smooth glassmorphism.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React icons, Vite.
- **Backend**: Python 3.14, FastAPI, SQLAlchemy ORM, SQLite / PostgreSQL, Pydantic v1.10.
- **Security & Auth**: JWT (JSON Web Tokens), salted SHA-256 password hashing.
- **Payments**: Indian NPCI UPI Deep Link Schema + SVG QR Code Engine.

---

## ⚡ Quickstart Guide

### 1. Start the Backend API
```bash
cd backend
python run.py
```
The FastAPI backend will start at `http://localhost:8000`.
- Interactive Swagger API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The React frontend will start at `http://localhost:5173`.

---

## 👤 Pre-Loaded Demo Credentials
The database is auto-seeded with 8+ authentic Indian startup techies:
- **Email**: `arjun@roomsync.ai`
- **Password**: `password123`
- **Persona**: Arjun Mehta, Senior Frontend Engineer at Swiggy, HSR Layout, Bengaluru.
