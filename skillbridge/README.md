# SkillBridge — Hyperlocal Economic Opportunity Platform

SkillBridge is a hyperlocal economic opportunity network designed for university students and neighboring communities. The platform connects student talent with local businesses and residents to facilitate micro-jobs, skills exchange, affordable boarding options, and supply donations. 

---

## 🌟 Demo Credentials & Accounts

To facilitate immediate, end-to-end hackathon presentations, the database has been seeded with two primary test accounts:

### 🎓 1. Student Profile (Alex Fernando)
* **Email**: `student@skillbridge.demo`
* **Password**: `password123`
* **Type**: `STUDENT`
* **University**: University of Ruhuna (Faculty of Technology)
* **Pre-seeded Skills**: React, Node.js, JavaScript, HTML, CSS, Graphic Design, Photoshop
* **Pre-seeded Stats**: Rs. 28,500 Earnings, 12 Completed Jobs, 4.9 ★ Rating, 91/100 Opportunity Score

### 👤 2. Community Member Profile (Kasun Perera)
* **Email**: `community@skillbridge.demo`
* **Password**: `password123`
* **Type**: `COMMUNITY_MEMBER`
* **Occupation**: Small Business Owner (ABC Printing Shop)
* **Pre-seeded Stats**: 18 Jobs Posted, 2 Active Hires, 4.8 ★ Rating

---

## 🚀 Step-by-Step Demonstration Walkthroughs

### 🔄 Demo Flow 1: The "Earn More" Economic Cycle (Gigs & Hiring)

1. **Access the Platform**: Navigate to `http://localhost:5173`.
2. **Student Login**: Click on the **Student quick login** card on the right-hand panel (Alex Fernando).
3. **Check Dashboard**:
   * Inspect the **Opportunity Score Card** showing Alex's dynamic score of `91/100` and its breakdown.
   * View the **Recommended Gigs** feed, which lists local community jobs.
4. **Browse & Apply for a Gig**:
   * Open the Gigs tab and select Kasun's gig: *"Need a promotional flyer designed for print shop"*.
   * Click **Apply for Gig**. Enter a proposed rate (e.g. `Rs. 5,000`), select duration `2 days`, type a cover message, and click **Submit**.
5. **Switch to Community Employer**:
   * Click **Sign Out** and select the **Community quick login** card (Kasun Perera).
6. **Hire the Student**:
   * Select the posted flyer design gig.
   * Click **Review Applicants (1)**.
   * Inspect the candidate card. View the calculated **AI Match Percentage** (e.g., `94%` match based on required skills like Graphic Design/Photoshop), the approximate **geographical distance**, and the recommendation breakdown.
   * Click **Hire Student**. An active contract is immediately created, and a notification is sent to the student.
7. **Complete & Rate the Student**:
   * Under the **My Jobs Tracker** tab, locate the flyer job (listed as *IN_PROGRESS*).
   * Click **Complete Job**. The status changes to *COMPLETED*.
   * Click **Rate Student**. Select `5 Stars` and write feedback (e.g. *"Great design!"*), then submit.
8. **Verify Reputation/Impact Updates**:
   * Sign out and log back in as the student `student@skillbridge.demo`.
   * Open **My Profile**. Note that the completed jobs count, total earnings, ratings feedback, and Opportunity Score have all been updated dynamically!

### 🔄 Demo Flow 2: The "Spend Less" Cycle (Supply Exchanges)

1. **Request a Resource**:
   * Logged in as student `student@skillbridge.demo`, open the **Donate & Resources** page.
   * Click **Post Item / Request**, select **Request Item**, fill in title *"Scientific Calculator fx-991EX"*, select category *Calculators*, type a location, and click **Submit**.
2. **Match Nearby Donations**:
   * Open details for the calculator request.
   * View the **Resource Matching Engine** list, which immediately returns Priyantha Perera's nearby available donation of a calculator (0.8 km away), ranked by distance and relevance.
3. **Complete Exchange**:
   * Call the phone number listed on the match.
   * Click **Mark as Received**. The request status is updated to *DONATED*, and the platform impact statistics (Items Reused, Community Savings) increment.

---

## 🛠️ System Architecture

SkillBridge is built as a unified ecosystem utilizing a **single user model** and **one authentication system**.

### Backend Directory Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── db.js          # MySQL connection pool
│   │   ├── schema.sql     # Database schema tables
│   │   └── initDb.js      # Programmatic schema parser & password hasher
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── gigController.js
│   │   ├── talentController.js
│   │   ├── jobController.js
│   │   ├── boardingController.js
│   │   ├── resourceController.js
│   │   ├── messageController.js
│   │   ├── notificationController.js
│   │   ├── nearbyController.js
│   │   └── impactController.js
│   ├── middleware/
│   │   └── auth.js        # JWT verification middleware
│   ├── utils/
│   │   └── matching.js    # Proximity & Opportunity matching engine
│   └── app.js             # Express application router
├── package.json
└── .env
```

### Frontend Directory Structure
```
frontend/
├── src/
│   ├── components/        # Reusable Tailwind forms and panels
│   ├── context/
│   │   └── AuthContext.jsx # Global token state provider
│   ├── layouts/
│   │   └── MainLayout.jsx # Collapsible navigation layout
│   ├── pages/             # All 11 navigation view components
│   ├── services/
│   │   └── api.js         # Fetch request interceptor utility
│   ├── App.jsx            # Client routing & authentication wrappers
│   └── index.css          # Tailwind and Leaflet styling overrides
├── package.json
└── tailwind.config.js
```

---

## 💻 Tech Stack & Port Mappings
* **React Frontend**: Vite Dev Server running on [http://localhost:5173/](http://localhost:5173/)
* **Express Backend**: Listening on [http://localhost:5000/](http://localhost:5000/)
* **Database**: MySQL 8.0 running on port `3306` with database name `skillbridge`
