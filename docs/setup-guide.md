# Apartment & Resident Management System
## Developer Setup, Execution & Testing Guide

**OS Target:** Windows 10 / 11 (PowerShell & VS Code)  
**Academic Project:** B.Tech AI Capstone — SRM Tiruchirappalli (2024–2028)  

---

## 1. System Prerequisites

1. **Python:** 3.11+ (Python 3.14 compatible)
2. **Node.js:** v18.0.0+ & npm
3. **Database:** SQLite 3 (WAL mode with enforced `PRAGMA foreign_keys = ON` configured out of the box), with native migration compatibility for PostgreSQL 14+ or MySQL 8.0.
4. **IDE:** Visual Studio Code

---

## 2. Fast-Start Execution (Windows PowerShell)

Open PowerShell in the project root directory: `c:\DATABASE MANAGEMENT`

### Step A: Backend Setup & Launch

```powershell
# 1. (Optional) Activate your virtual environment if one is created
# .venv\Scripts\Activate.ps1

# 2. Install backend dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers

# 3. Apply database migrations
python backend/manage.py migrate

# 4. (Optional) If starting fresh, seed database with 240 units & realistic test data
python backend/manage.py seed_db

# 5. Launch Django REST API server
python backend/manage.py runserver 127.0.0.1:8000
```
Backend API will be live at `http://127.0.0.1:8000/api/`

---

### Step B: Frontend Setup & Launch

Open a second PowerShell terminal in `c:\DATABASE MANAGEMENT\frontend`:

```powershell
# 1. Install frontend dependencies
npm install

# 2. Start Vite development server
npm run dev
```
Frontend Web Portal will be live at `http://localhost:5173`

---

## 3. Pre-Configured Test Accounts (Demonstration Roles)

The application includes 1-click role switcher buttons in both the **Login Screen** and the **Diagnostic Top Ribbon** of the application shell.

| Role | Username | Password | Privileges |
|---|---|---|---|
| **Administrator (SRM)** | `admin` | `Admin@123` | Full access to all 18 modules, billing triggers, user management, and immutable audit logs. |
| **Resident / Owner** | `resident_arun` | `Resident@123` | Data-isolated portal: view own flat bills, pay dues, raise service tickets, book facilities. |
| **Security Guard (Staff)** | `guard_ramesh` | `Staff@123` | Fast gate check-in/out, visitor vehicle logging, view building units. |

---

## 4. Executing Automated Test Suite

To run the complete 12-test automated integration suite verifying relational constraints, transaction serializability, and business logic:

```powershell
python backend/manage.py test backend/tests
```

**Verified Test Coverage:**
1. `test_01_user_authentication_and_jwt`: JWT issue, payload decoding, and role claim verification.
2. `test_02_resident_data_isolation`: Server-side RBAC data isolation (residents cannot query peers).
3. `test_03_occupancy_history_preservation`: Temporal move-in/move-out logging without overwriting historical records.
4. `test_04_invalid_occupancy_date_range_rejected`: Database check constraint rejection of move_out < move_in.
5. `test_05_invoice_generation_and_balance_arithmetic`: Decimal arithmetic, base amount + late fee balances.
6. `test_06_payment_recording_and_overpayment_protection`: Atomic balance update and rejection of payments exceeding due balance.
7. `test_07_late_fee_calculation`: Configurable late fee policy formula enforcement.
8. `test_08_service_ticket_state_machine`: Validated transitions (`OPEN` -> `ASSIGNED` -> `IN_PROGRESS` -> `RESOLVED`).
9. `test_09_amenity_booking_conflict_prevention`: Rejection of overlapping facility reservations.
10. `test_10_parking_quota_enforcement`: Enforcement of per-flat parking allocation quota limits.
11. `test_11_visitor_gate_checkin_and_checkout`: Generation of visitor passes and checkout timestamping.
12. `test_12_audit_log_immutability`: Verification of audit trail recording and immutability.

---

## 5. Production Build Verification

To test that the frontend bundles cleanly without errors:

```powershell
npm --prefix frontend run build
```
Build output is saved to `frontend/dist/`.
