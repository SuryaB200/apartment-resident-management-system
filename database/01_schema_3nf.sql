-- ============================================================================
-- APARTMENT & RESIDENT MANAGEMENT SYSTEM
-- Capstone Project: DBMS Review 1 & 2
-- SRM Institute of Science and Technology, Tiruchirappalli
-- Department of Artificial Intelligence (2024-2028)
--
-- File 01: 3NF Relational Database Schema DDL (ANSI SQL / MySQL 8.0 / PostgreSQL)
-- ============================================================================

-- 1. BUILDINGS / TOWERS
CREATE TABLE IF NOT EXISTS properties_building (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    building_code VARCHAR(20) NOT NULL UNIQUE,
    total_floors INT NOT NULL CHECK (total_floors > 0),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. FLATS / RESIDENTIAL UNITS
CREATE TABLE IF NOT EXISTS properties_flat (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    building_id BIGINT NOT NULL,
    flat_number VARCHAR(10) NOT NULL,
    floor_number INT NOT NULL CHECK (floor_number >= 0),
    carpet_area_sqft DECIMAL(8, 2) NOT NULL CHECK (carpet_area_sqft > 0),
    flat_type VARCHAR(20) NOT NULL,
    occupancy_status VARCHAR(20) NOT NULL DEFAULT 'VACANT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_flat_building FOREIGN KEY (building_id) REFERENCES properties_building(id) ON DELETE RESTRICT,
    CONSTRAINT uq_flat_building_number UNIQUE (building_id, flat_number)
);

CREATE INDEX idx_flat_occupancy_status ON properties_flat(occupancy_status);

-- 3. USERS & ROLES
CREATE TABLE IF NOT EXISTS accounts_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(128) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'RESIDENT',
    phone VARCHAR(20),
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_role ON accounts_user(role);

-- 4. STAFF PROFILES
CREATE TABLE IF NOT EXISTS accounts_staffprofile (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    designation VARCHAR(100) NOT NULL,
    shift VARCHAR(20) NOT NULL DEFAULT 'DAY',
    phone VARCHAR(20),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES accounts_user(id) ON DELETE CASCADE
);

-- 5. RESIDENTS MASTER DIRECTORY
CREATE TABLE IF NOT EXISTS residents_resident (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE,
    flat_id BIGINT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    resident_type VARCHAR(20) NOT NULL DEFAULT 'TENANT',
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    aadhaar_hash VARCHAR(64),
    emergency_contact VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resident_user FOREIGN KEY (user_id) REFERENCES accounts_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_resident_flat FOREIGN KEY (flat_id) REFERENCES properties_flat(id) ON DELETE SET NULL
);

CREATE INDEX idx_resident_type ON residents_resident(resident_type);

-- 6. TEMPORAL OCCUPANCY HISTORY
CREATE TABLE IF NOT EXISTS occupancy_occupancyhistory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    flat_id BIGINT NOT NULL,
    resident_id BIGINT NOT NULL,
    occupancy_type VARCHAR(20) NOT NULL,
    move_in_date DATE NOT NULL,
    move_out_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_occupancy_flat FOREIGN KEY (flat_id) REFERENCES properties_flat(id) ON DELETE RESTRICT,
    CONSTRAINT fk_occupancy_resident FOREIGN KEY (resident_id) REFERENCES residents_resident(id) ON DELETE RESTRICT,
    CONSTRAINT chk_occupancy_dates CHECK (move_out_date IS NULL OR move_out_date >= move_in_date)
);

CREATE INDEX idx_occupancy_current ON occupancy_occupancyhistory(flat_id, is_current);

-- 7. LATE FEE POLICY
CREATE TABLE IF NOT EXISTS billing_latefeepolicy (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    policy_name VARCHAR(100) NOT NULL UNIQUE,
    grace_period_days INT NOT NULL DEFAULT 5,
    late_fee_percentage DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 8. MAINTENANCE INVOICES
CREATE TABLE IF NOT EXISTS billing_maintenanceinvoice (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    flat_id BIGINT NOT NULL,
    billing_period_month DATE NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    base_amount DECIMAL(12, 2) NOT NULL CHECK (base_amount >= 0),
    late_fee DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (late_fee >= 0),
    total_amount DECIMAL(12, 2) NOT NULL CHECK (total_amount >= 0),
    amount_paid DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (amount_paid >= 0),
    outstanding_balance DECIMAL(12, 2) NOT NULL CHECK (outstanding_balance >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ISSUED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoice_flat FOREIGN KEY (flat_id) REFERENCES properties_flat(id) ON DELETE RESTRICT,
    CONSTRAINT uq_invoice_flat_period UNIQUE (flat_id, billing_period_month),
    CONSTRAINT chk_invoice_due_date CHECK (due_date >= issue_date)
);

CREATE INDEX idx_invoice_status ON billing_maintenanceinvoice(status);

-- 9. PAYMENTS & RECEIPTS
CREATE TABLE IF NOT EXISTS billing_payment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_id BIGINT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_mode VARCHAR(30) NOT NULL,
    transaction_reference VARCHAR(100) NOT NULL UNIQUE,
    recorded_by_id BIGINT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_invoice FOREIGN KEY (invoice_id) REFERENCES billing_maintenanceinvoice(id) ON DELETE RESTRICT,
    CONSTRAINT fk_payment_recorded_by FOREIGN KEY (recorded_by_id) REFERENCES accounts_user(id) ON DELETE SET NULL
);

-- 10. SERVICE TICKETS
CREATE TABLE IF NOT EXISTS maintenance_serviceticket (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    flat_id BIGINT NOT NULL,
    raised_by_id BIGINT NOT NULL,
    assigned_to_id BIGINT,
    category VARCHAR(30) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    resolution_notes TEXT,
    sla_deadline TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP,
    feedback_rating INT CHECK (feedback_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ticket_flat FOREIGN KEY (flat_id) REFERENCES properties_flat(id) ON DELETE RESTRICT,
    CONSTRAINT fk_ticket_raised_by FOREIGN KEY (raised_by_id) REFERENCES residents_resident(id) ON DELETE RESTRICT,
    CONSTRAINT fk_ticket_assigned_to FOREIGN KEY (assigned_to_id) REFERENCES accounts_staffprofile(id) ON DELETE SET NULL
);

CREATE INDEX idx_ticket_status ON maintenance_serviceticket(status);

-- 11. VISITOR GATE LOGS
CREATE TABLE IF NOT EXISTS visitors_visitorlog (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pass_number VARCHAR(50) NOT NULL UNIQUE,
    visitor_name VARCHAR(150) NOT NULL,
    visitor_phone VARCHAR(20) NOT NULL,
    flat_id BIGINT NOT NULL,
    purpose_of_visit VARCHAR(100) NOT NULL,
    vehicle_number VARCHAR(30),
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP,
    guard_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'CHECKED_IN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_visitor_flat FOREIGN KEY (flat_id) REFERENCES properties_flat(id) ON DELETE RESTRICT,
    CONSTRAINT fk_visitor_guard FOREIGN KEY (guard_id) REFERENCES accounts_user(id) ON DELETE SET NULL
);

CREATE INDEX idx_visitor_status ON visitors_visitorlog(status);

-- 12. AMENITIES & BOOKINGS
CREATE TABLE IF NOT EXISTS amenities_amenity (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(30) NOT NULL UNIQUE,
    description TEXT,
    capacity INT NOT NULL CHECK (capacity > 0),
    hourly_rate DECIMAL(8, 2) NOT NULL DEFAULT 0.00 CHECK (hourly_rate >= 0),
    is_operational BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS amenities_amenitybooking (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    amenity_id BIGINT NOT NULL,
    resident_id BIGINT NOT NULL,
    flat_id BIGINT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    booking_status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_amenity FOREIGN KEY (amenity_id) REFERENCES amenities_amenity(id) ON DELETE RESTRICT,
    CONSTRAINT fk_booking_resident FOREIGN KEY (resident_id) REFERENCES residents_resident(id) ON DELETE RESTRICT,
    CONSTRAINT fk_booking_flat FOREIGN KEY (flat_id) REFERENCES properties_flat(id) ON DELETE RESTRICT,
    CONSTRAINT chk_booking_time CHECK (end_time > start_time)
);

CREATE INDEX idx_booking_amenity_time ON amenities_amenitybooking(amenity_id, start_time, end_time);

-- 13. PARKING SLOTS & ALLOCATIONS
CREATE TABLE IF NOT EXISTS parking_parkingslot (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    slot_number VARCHAR(30) NOT NULL UNIQUE,
    location_zone VARCHAR(100) NOT NULL DEFAULT 'Basement Level 1',
    slot_type VARCHAR(20) NOT NULL DEFAULT 'FOUR_WHEELER',
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parking_parkingallocation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    slot_id BIGINT NOT NULL,
    flat_id BIGINT NOT NULL,
    resident_id BIGINT NOT NULL,
    vehicle_number VARCHAR(30) NOT NULL,
    vehicle_make_model VARCHAR(100),
    vehicle_type VARCHAR(20) NOT NULL DEFAULT 'CAR',
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_allocation_slot FOREIGN KEY (slot_id) REFERENCES parking_parkingslot(id) ON DELETE RESTRICT,
    CONSTRAINT fk_allocation_flat FOREIGN KEY (flat_id) REFERENCES properties_flat(id) ON DELETE RESTRICT,
    CONSTRAINT fk_allocation_resident FOREIGN KEY (resident_id) REFERENCES residents_resident(id) ON DELETE RESTRICT
);

CREATE INDEX idx_allocation_active ON parking_parkingallocation(is_active);

-- 14. AUDIT LOGS (IMMUTABLE FORENSIC TRAIL)
CREATE TABLE IF NOT EXISTS audit_auditlog (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    acting_user_id BIGINT,
    action VARCHAR(40) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (acting_user_id) REFERENCES accounts_user(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_timestamp ON audit_auditlog(timestamp);
CREATE INDEX idx_audit_entity ON audit_auditlog(entity_type, record_id);
