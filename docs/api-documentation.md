# Apartment & Resident Management System
## RESTful API Specification & Developer Guide

**Base URL:** `http://127.0.0.1:8000/api/`  
**Authentication Scheme:** JSON Web Token (JWT) — RFC 7519  
**Header Format:** `Authorization: Bearer <access_token>`

---

## 1. Authentication Endpoints

### 1.1 Login & Obtain JWT Pair
- **Endpoint:** `POST /api/auth/login/`
- **Access:** Public
- **Request Body:**
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```
- **Response (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@apartment.internal",
    "role": "ADMIN",
    "first_name": "System",
    "last_name": "Administrator"
  }
}
```

### 1.2 Current Authenticated User Profile
- **Endpoint:** `GET /api/auth/me/`
- **Access:** Authenticated (`ADMIN`, `RESIDENT`, `STAFF`)

---

## 2. Properties & Flats Module

### 2.1 List Residential Buildings
- **Endpoint:** `GET /api/properties/buildings/`
- **Access:** Authenticated

### 2.2 List Flat Units
- **Endpoint:** `GET /api/properties/flats/`
- **Query Params:** `?building_code=BLK-A&status=OCCUPIED&page_size=50`
- **Response (200 OK):**
```json
{
  "count": 240,
  "results": [
    {
      "id": 1,
      "building": 1,
      "building_code": "BLK-A",
      "building_name": "Aster Tower",
      "flat_number": "101",
      "full_flat_code": "BLK-A-101",
      "floor_number": 1,
      "carpet_area_sqft": "1250.00",
      "flat_type": "2BHK",
      "occupancy_status": "OCCUPIED",
      "current_resident": {
        "id": 4,
        "name": "Arun Kumar",
        "type": "OWNER"
      }
    }
  ]
}
```

### 2.3 Create Flat Unit
- **Endpoint:** `POST /api/properties/flats/`
- **Access:** Admin only

---

## 3. Resident Directory Module

### 3.1 List Residents
- **Endpoint:** `GET /api/residents/`
- **Access:** Admin / Staff (Residents see isolated self profile only)
- **Query Params:** `?resident_type=OWNER&search=Arun`

### 3.2 Register Resident (KYC)
- **Endpoint:** `POST /api/residents/`
- **Request Body:**
```json
{
  "first_name": "Kavitha",
  "last_name": "Rajan",
  "resident_type": "TENANT",
  "contact_number": "9840198401",
  "email": "kavitha.rajan@example.com",
  "flat": 14
}
```

---

## 4. Temporal Occupancy Module

### 4.1 Tenancy Timeline
- **Endpoint:** `GET /api/occupancy/`
- **Query Params:** `?flat=1&is_current=true`

### 4.2 Assign New Tenancy
- **Endpoint:** `POST /api/occupancy/`
- **Request Body:**
```json
{
  "flat": 14,
  "resident": 8,
  "occupancy_type": "TENANT",
  "move_in_date": "2024-11-01"
}
```

### 4.3 Terminate Tenancy (Move-Out)
- **Endpoint:** `POST /api/occupancy/{id}/terminate/`
- **Request Body:**
```json
{
  "move_out_date": "2025-05-31"
}
```

---

## 5. Maintenance Billing & Payment Module

### 5.1 List Maintenance Invoices
- **Endpoint:** `GET /api/billing/invoices/`
- **Query Params:** `?status=OVERDUE&billing_period=2024-10-01`

### 5.2 Execute Monthly Billing Cycle Trigger
- **Endpoint:** `POST /api/billing/invoices/run_billing_cycle/`
- **Access:** Admin only
- **Request Body:**
```json
{
  "billing_date": "2024-11-01",
  "rate_per_sqft": 3.50,
  "due_days": 15
}
```
- **Response (200 OK):**
```json
{
  "message": "Billing cycle run completed.",
  "invoices_created": 198,
  "late_fees_applied": 14
}
```

### 5.3 Record Payment Settlement (Atomic Transaction)
- **Endpoint:** `POST /api/billing/payments/`
- **Request Body:**
```json
{
  "invoice": 12,
  "amount": "4375.00",
  "payment_mode": "UPI",
  "transaction_reference": "UPI-IND-202410-998822"
}
```

---

## 6. Service Ticketing & SLA Module

### 6.1 List Service Tickets
- **Endpoint:** `GET /api/maintenance/tickets/`
- **Query Params:** `?status=OPEN&priority=HIGH`

### 6.2 Submit Complaint
- **Endpoint:** `POST /api/maintenance/tickets/`
- **Request Body:**
```json
{
  "flat": 1,
  "category": "PLUMBING",
  "priority": "HIGH",
  "title": "Main bathroom sink drainage leakage",
  "description": "Continuous water seepage under cabinet."
}
```

### 6.3 Advance Ticket State Machine
- **Endpoint:** `POST /api/maintenance/tickets/{id}/transition/`
- **Request Body:**
```json
{
  "target_status": "ASSIGNED",
  "assigned_to": 2,
  "notes": "Assigned to on-duty master plumber."
}
```

---

## 7. Gate Security & Visitor Registry

### 7.1 Fast Gate Check-In Pass
- **Endpoint:** `POST /api/visitors/logs/`
- **Request Body:**
```json
{
  "visitor_name": "Suresh Raina",
  "visitor_phone": "9841029384",
  "flat": 4,
  "purpose_of_visit": "Family Guest",
  "vehicle_number": "TN-45-AZ-1234"
}
```

### 7.2 Gate Checkout (Exit Pass)
- **Endpoint:** `POST /api/visitors/logs/{id}/checkout/`

---

## 8. Amenities & Parking Modules

### 8.1 Reserve Facility (ACID Row-Locking)
- **Endpoint:** `POST /api/amenities/reservations/`
- **Request Body:**
```json
{
  "amenity": 1,
  "flat": 4,
  "start_time": "2024-11-15T18:00:00Z",
  "end_time": "2024-11-15T21:00:00Z"
}
```

### 8.2 Allocate Parking Bay (Quota Enforced)
- **Endpoint:** `POST /api/parking/allocations/`
- **Request Body:**
```json
{
  "slot": 15,
  "flat": 4,
  "resident": 4,
  "vehicle_number": "TN-45-AZ-9988",
  "vehicle_type": "CAR"
}
```

### 8.3 Release Parking Bay
- **Endpoint:** `POST /api/parking/allocations/{id}/release/`

---

## 9. Reporting & Metrics Module

### 9.1 Administrator Dashboard KPI Summary
- **Endpoint:** `GET /api/reporting/metrics/dashboard/`

### 9.2 Defaulters Ledger View
- **Endpoint:** `GET /api/reporting/metrics/defaulters/`

### 9.3 Technician SLA Turnaround Summary
- **Endpoint:** `GET /api/reporting/metrics/sla/`

### 9.4 Academic Capstone Project Metadata
- **Endpoint:** `GET /api/reporting/capstone/info/`
