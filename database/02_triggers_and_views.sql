-- ============================================================================
-- APARTMENT & RESIDENT MANAGEMENT SYSTEM
-- File 02: Relational SQL Triggers & Analytical Ledger Views
-- Compatible with PostgreSQL & MySQL 8.0
-- ============================================================================

-- ----------------------------------------------------------------------------
-- VIEW 1: Defaulters Ledger View (Real-time Arrears & Penalty Tracking)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_defaulters_ledger AS
SELECT 
    f.id AS flat_id,
    CONCAT(b.building_code, '-', f.flat_number) AS flat_code,
    b.name AS building_name,
    CONCAT(r.first_name, ' ', r.last_name) AS resident_name,
    r.contact_number,
    r.resident_type,
    COUNT(i.id) AS unpaid_invoice_count,
    COALESCE(SUM(i.base_amount), 0.00) AS base_maintenance_due,
    COALESCE(SUM(i.late_fee), 0.00) AS late_fees_due,
    COALESCE(SUM(i.outstanding_balance), 0.00) AS total_arrears
FROM properties_flat f
JOIN properties_building b ON f.building_id = b.id
LEFT JOIN residents_resident r ON f.id = r.flat_id AND r.is_active = TRUE
JOIN billing_maintenanceinvoice i ON f.id = i.flat_id
WHERE i.status IN ('ISSUED', 'PARTIALLY_PAID', 'OVERDUE')
  AND i.outstanding_balance > 0
GROUP BY 
    f.id, b.building_code, f.flat_number, b.name, 
    r.first_name, r.last_name, r.contact_number, r.resident_type;


-- ----------------------------------------------------------------------------
-- VIEW 2: Block Occupancy & Density Summary View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_block_occupancy_summary AS
SELECT 
    b.id AS building_id,
    b.building_code,
    b.name AS building_name,
    b.total_floors,
    COUNT(f.id) AS total_units,
    SUM(CASE WHEN f.occupancy_status = 'OCCUPIED' THEN 1 ELSE 0 END) AS occupied_units,
    SUM(CASE WHEN f.occupancy_status = 'VACANT' THEN 1 ELSE 0 END) AS vacant_units,
    SUM(CASE WHEN f.occupancy_status = 'MAINTENANCE' THEN 1 ELSE 0 END) AS maintenance_units,
    ROUND(
        (SUM(CASE WHEN f.occupancy_status = 'OCCUPIED' THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(f.id), 0),
        2
    ) AS occupancy_percentage
FROM properties_building b
LEFT JOIN properties_flat f ON b.id = f.building_id
GROUP BY b.id, b.building_code, b.name, b.total_floors;


-- ----------------------------------------------------------------------------
-- TRIGGER: Prevent Negative Invoice Outstanding Balance (ACID Safeguard)
-- MySQL 8.0 Syntax:
-- ----------------------------------------------------------------------------
DELIMITER $$

CREATE TRIGGER trg_prevent_negative_invoice_balance
BEFORE UPDATE ON billing_maintenanceinvoice
FOR EACH ROW
BEGIN
    IF NEW.outstanding_balance < 0.00 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaction Rejected: Invoice outstanding balance cannot be negative.';
    END IF;
    
    IF NEW.amount_paid > NEW.total_amount THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaction Rejected: Cumulative payment exceeds invoice total amount.';
    END IF;
END$$

DELIMITER ;
