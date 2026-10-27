# Apartment & Resident Management System
## Relational Database Schema Specification (Third Normal Form - 3NF)

**Institution:** SRM Institute of Science and Technology, Tiruchirappalli  
**Degree / Department:** B.Tech — Artificial Intelligence (2024–2028)  
**Capstone Course:** Database Management Systems (DBMS)  
**Faculty Guide:** Dr. S. P. Ramya  
**Student Team:**
- Surya B — `RA2411047050042`
- Rohan raj — `RA2411047050010`
- Saminathan M — `RA2411047050055`

---

## 1. Relational Architecture & Normalization Proof

The system eliminates operational anomalies by adhering to strict **Third Normal Form (3NF)** rules:

1. **First Normal Form (1NF):**
   - All attributes are atomic (no repeating groups, comma-delimited lists, or arrays).
   - Each table has a defined primary key (`id` with integer auto-increment or UUID).
   - Flat codes (`block_id`, `flat_number`), vehicle numbers, and UTRs are uniquely isolated.

2. **Second Normal Form (2NF):**
   - 1NF satisfied.
   - All non-key attributes are fully functionally dependent on the entire primary key (no partial dependencies on composite keys).
   - E.g., `OccupancyHistory` attributes (`move_in_date`, `move_out_date`, `is_current`) depend on the unique surrogate primary key, with candidate composite constraints `(flat_id, resident_id, move_in_date)`.

3. **Third Normal Form (3NF):**
   - 2NF satisfied.
   - Zero transitive dependencies ($X \to Y$ where $Y$ is non-prime and depends on non-key $X$).
   - *Example:* Flat carpet area and block ID belong strictly in `Flats`. Invoices reference only `flat_id`; they do not store redundant tenant names or contact numbers (which are accessed via relational joins on `OccupancyHistory` and `Residents`).
   - *Example:* Payments reference `invoice_id` only; they do not duplicate flat maintenance rates or due dates.

---

## 2. Core Entities & Schema Reference

### 1. `Flats` (`properties_flat`)
*Unit taxonomy, carpet area, and real-time occupancy state.*

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Surrogate primary key |
| `building_id` | BIGINT | FOREIGN KEY -> `Building(id)` ON DELETE RESTRICT | Associated residential tower/block |
| `flat_number` | VARCHAR(10) | NOT NULL | Flat door identifier (e.g. `101`, `402`) |
| `floor_number` | INTEGER | NOT NULL, CHECK (>= 0) | Level in tower |
| `carpet_area_sqft`| DECIMAL(8,2) | NOT NULL, CHECK (> 0) | Registered carpet area for billing rate |
| `flat_type` | VARCHAR(20) | NOT NULL, ENUM (`1BHK`, `2BHK`, `3BHK`, `4BHK`, `PENTHOUSE`) | Unit configuration |
| `occupancy_status`| VARCHAR(20) | NOT NULL, ENUM (`VACANT`, `OCCUPIED`, `MAINTENANCE`), DEFAULT `VACANT` | Operational state |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Row insertion timestamp |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Last update timestamp |

- **Unique Constraint:** `UNIQUE(building_id, flat_number)` — Guarantees no duplicate flat numbers within the same block.

---

### 2. `Residents` (`residents_resident`)
*Primary resident directory, KYC verification, and ownership classification.*

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Surrogate primary key |
| `user_id` | BIGINT | UNIQUE, FOREIGN KEY -> `User(id)` ON DELETE CASCADE, NULLABLE | Optional portal account linkage |
| `flat_id` | BIGINT | FOREIGN KEY -> `Flat(id)` ON DELETE SET NULL, NULLABLE | Currently occupied flat |
| `first_name` | VARCHAR(100) | NOT NULL | Resident legal first name |
| `last_name` | VARCHAR(100) | NOT NULL | Resident legal surname |
| `resident_type` | VARCHAR(20) | NOT NULL, ENUM (`OWNER`, `TENANT`) | Property tenure type |
| `contact_number`| VARCHAR(20) | NOT NULL | Verified primary phone number |
| `email` | VARCHAR(255) | NULLABLE | Billing & notice email address |
| `aadhaar_hash` | VARCHAR(64) | NULLABLE | SHA-256 digested identity verification |
| `emergency_contact`| VARCHAR(20)| NULLABLE | Next of kin contact number |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active member flag |

---

### 3. `Occupancy_History` (`occupancy_occupancyhistory`)
*Temporal tenancy repository preventing historical overwrites.*

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Surrogate primary key |
| `flat_id` | BIGINT | FOREIGN KEY -> `Flat(id)` ON DELETE RESTRICT | Flat unit |
| `resident_id` | BIGINT | FOREIGN KEY -> `Resident(id)` ON DELETE RESTRICT | Resident entity |
| `occupancy_type`| VARCHAR(20)| NOT NULL, ENUM (`OWNER`, `TENANT`) | Tenancy classification |
| `move_in_date` | DATE | NOT NULL | Lease commencement / move-in date |
| `move_out_date` | DATE | NULLABLE | Tenancy conclusion date |
| `is_current` | BOOLEAN | DEFAULT TRUE | Active tenure indicator |

- **Check Constraint:** `CHECK (move_out_date IS NULL OR move_out_date >= move_in_date)` — Rejects chronologically invalid date ranges.
- **Indexes:** `INDEX(flat_id, is_current)`, `INDEX(resident_id)`

---

### 4. `Maintenance_Invoices` (`billing_maintenanceinvoice`)
*Periodic maintenance billing ledger with decimal arithmetic.*

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Surrogate primary key |
| `invoice_number` | VARCHAR(50) | UNIQUE, NOT NULL | Deterministic code: `INV-{YEAR}{MONTH}-{FLAT}` |
| `flat_id` | BIGINT | FOREIGN KEY -> `Flat(id)` ON DELETE RESTRICT | Billed flat unit |
| `billing_period_month` | DATE | NOT NULL | Month anchor (e.g. `2024-10-01`) |
| `issue_date` | DATE | NOT NULL | Generation timestamp |
| `due_date` | DATE | NOT NULL, CHECK (due_date >= issue_date) | Payment deadline |
| `base_amount` | DECIMAL(12,2) | NOT NULL, CHECK (>= 0) | Base maintenance fee |
| `late_fee` | DECIMAL(12,2) | DEFAULT 0.00, CHECK (>= 0) | Penalties computed via configurable policy |
| `total_amount` | DECIMAL(12,2) | NOT NULL, CHECK (total_amount = base_amount + late_fee) | Gross billable sum |
| `amount_paid` | DECIMAL(12,2) | DEFAULT 0.00, CHECK (>= 0) | Cumulative settled payments |
| `outstanding_balance`| DECIMAL(12,2)| NOT NULL, CHECK (outstanding_balance >= 0) | Remaining dues |
| `status` | VARCHAR(20) | ENUM (`DRAFT`, `ISSUED`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`) | State machine status |

- **Unique Constraint:** `UNIQUE(flat_id, billing_period_month)` — Blocks duplicate invoice issuance.

---

### 5. `Payments` (`billing_payment`)
*Atomic settlement ledger preventing double payments and overpayment anomalies.*

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Surrogate primary key |
| `receipt_number`| VARCHAR(50) | UNIQUE, NOT NULL | Formal receipt reference: `REC-{YYYYMMDD}-{ID}` |
| `invoice_id` | BIGINT | FOREIGN KEY -> `MaintenanceInvoice(id)` ON DELETE RESTRICT | Target invoice |
| `amount` | DECIMAL(12,2) | NOT NULL, CHECK (> 0) | Transaction payment amount |
| `payment_date` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Transaction timestamp |
| `payment_mode` | VARCHAR(30) | NOT NULL, ENUM (`UPI`, `NEFT`, `RTGS`, `CHEQUE`, `CASH`, `CARD`)| Method of payment |
| `transaction_reference` | VARCHAR(100)| UNIQUE, NOT NULL | Banking UTR / Cheque clearance number |
| `recorded_by_id` | BIGINT | FOREIGN KEY -> `User(id)` ON DELETE SET NULL, NULLABLE | Attributed staff/admin user |

---

### 6. `Service_Tickets` (`maintenance_serviceticket`)
*Complaint state machine and SLA turnaround metrics.*

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Surrogate primary key |
| `ticket_number` | VARCHAR(50) | UNIQUE, NOT NULL | Sequential complaint ID: `TKT-{YEAR}-{SEQ}` |
| `flat_id` | BIGINT | FOREIGN KEY -> `Flat(id)` ON DELETE RESTRICT | Originating flat unit |
| `raised_by_id` | BIGINT | FOREIGN KEY -> `Resident(id)` ON DELETE RESTRICT | Complainant resident profile |
| `assigned_to_id` | BIGINT | FOREIGN KEY -> `StaffProfile(id)` ON DELETE SET NULL | Dispatched technician profile |
| `category` | VARCHAR(30) | ENUM (`PLUMBING`, `ELECTRICAL`, `CARPENTRY`, `ELEVATOR`, `SECURITY`, `CIVIL`, `OTHER`) | Trade domain |
| `priority` | VARCHAR(20) | ENUM (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), DEFAULT `MEDIUM` | Severity classification |
| `status` | VARCHAR(20) | ENUM (`OPEN`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), DEFAULT `OPEN` | State machine status |
| `title` | VARCHAR(200) | NOT NULL | Short issue summary |
| `description` | TEXT | NOT NULL | Detailed problem description |
| `resolution_notes` | TEXT | NULLABLE | Technician completion notes |
| `sla_deadline` | TIMESTAMP | NOT NULL | Computed target resolution timestamp |
| `resolved_at` | TIMESTAMP | NULLABLE | Actual resolution timestamp |

---

### 7. `Visitor_Logs` (`visitors_visitorlog`)
*Gatekeeper access log and verified vehicle registry.*

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Surrogate primary key |
| `pass_number` | VARCHAR(50) | UNIQUE, NOT NULL | Gate entry pass: `VIS-{YYYYMMDD}-{SEQ}` |
| `visitor_name` | VARCHAR(150) | NOT NULL | Full name of visiting guest / courier |
| `visitor_phone` | VARCHAR(20) | NOT NULL | Contact telephone |
| `flat_id` | BIGINT | FOREIGN KEY -> `Flat(id)` ON DELETE RESTRICT | Destination residential flat |
| `purpose_of_visit`| VARCHAR(100)| NOT NULL | Delivery, Guest, Contractor, etc. |
| `vehicle_number` | VARCHAR(30) | NULLABLE | Guest car/bike plate number |
| `check_in_time` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Gate arrival timestamp |
| `check_out_time`| TIMESTAMP | NULLABLE | Gate departure timestamp |
| `guard_id` | BIGINT | FOREIGN KEY -> `User(id)` ON DELETE SET NULL | Attributed on-duty gatekeeper |
| `status` | VARCHAR(20) | ENUM (`CHECKED_IN`, `CHECKED_OUT`), DEFAULT `CHECKED_IN` | Current visitor status |

---

### 8. `Amenities` & `Amenity_Bookings` (`amenities_amenity`, `amenities_amenitybooking`)
*Shared facilities and concurrency-safe reservation registry.*

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Surrogate primary key |
| `amenity_id` | BIGINT | FOREIGN KEY -> `Amenity(id)` ON DELETE RESTRICT | Target facility |
| `resident_id` | BIGINT | FOREIGN KEY -> `Resident(id)` ON DELETE RESTRICT | Booking resident |
| `flat_id` | BIGINT | FOREIGN KEY -> `Flat(id)` ON DELETE RESTRICT | Associated flat |
| `start_time` | TIMESTAMP | NOT NULL | Slot start |
| `end_time` | TIMESTAMP | NOT NULL, CHECK (end_time > start_time) | Slot end |
| `booking_status`| VARCHAR(20)| ENUM (`CONFIRMED`, `CANCELLED`), DEFAULT `CONFIRMED` | Booking state |

- **Concurrency Control:** Serialized using `select_for_update()` row-level locks inside atomic transactions to eliminate race conditions and double-bookings.

---

### 9. `Parking_Slots` & `Parking_Allocations` (`parking_parkingslot`, `parking_parkingallocation`)
*Demarcated vehicle bay master and quota enforcement.*

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Surrogate primary key |
| `slot_id` | BIGINT | FOREIGN KEY -> `ParkingSlot(id)` ON DELETE RESTRICT | Physical demarcated bay |
| `flat_id` | BIGINT | FOREIGN KEY -> `Flat(id)` ON DELETE RESTRICT | Allocated flat |
| `resident_id` | BIGINT | FOREIGN KEY -> `Resident(id)` ON DELETE RESTRICT | Vehicle owner |
| `vehicle_number`| VARCHAR(30) | NOT NULL | Plate registration number |
| `vehicle_type` | VARCHAR(20) | ENUM (`CAR`, `BIKE`, `OTHER`), DEFAULT `CAR` | Vehicle class |
| `allocated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Allocation date |
| `released_at` | TIMESTAMP | NULLABLE | De-allocation date |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active assignment status |

- **Quota Enforcement:** Validates active allocations count against `MAX_PARKING_SLOTS_PER_FLAT` (default 2) inside database transactions.
