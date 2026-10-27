from django.db import migrations

SQL_TRIGGERS_AND_VIEWS = """
-- View 1: Real-Time Defaulters Ledger View (Aggregated Financial Dues)
CREATE VIEW IF NOT EXISTS v_defaulters_ledger AS
SELECT 
    f.id AS flat_id,
    f.flat_number,
    b.code AS block_code,
    b.name AS block_name,
    r.id AS resident_id,
    r.first_name || ' ' || r.last_name AS resident_name,
    r.phone AS resident_phone,
    COUNT(inv.id) AS unpaid_invoices_count,
    SUM(inv.outstanding_balance) AS total_outstanding_due,
    MIN(inv.due_date) AS earliest_due_date
FROM billing_maintenanceinvoice inv
JOIN properties_flat f ON inv.flat_id = f.id
JOIN properties_building b ON f.building_id = b.id
LEFT JOIN residents_resident r ON inv.resident_id = r.id
WHERE inv.outstanding_balance > 0
GROUP BY f.id, f.flat_number, b.code, b.name, r.id, r.first_name, r.last_name, r.phone;

-- View 2: Block Occupancy Summary View
CREATE VIEW IF NOT EXISTS v_block_occupancy_summary AS
SELECT
    b.id AS building_id,
    b.code AS block_code,
    b.name AS block_name,
    COUNT(f.id) AS total_units,
    SUM(CASE WHEN f.occupancy_status = 'OCCUPIED' THEN 1 ELSE 0 END) AS occupied_units,
    SUM(CASE WHEN f.occupancy_status = 'VACANT' THEN 1 ELSE 0 END) AS vacant_units,
    ROUND(CAST(SUM(CASE WHEN f.occupancy_status = 'OCCUPIED' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(f.id) * 100.0, 1) AS occupancy_percentage
FROM properties_building b
LEFT JOIN properties_flat f ON b.id = f.building_id
GROUP BY b.id, b.code, b.name;

-- Trigger: Prevent Negative Balance on Maintenance Invoices
CREATE TRIGGER IF NOT EXISTS trg_prevent_negative_invoice_balance
BEFORE UPDATE OF outstanding_balance ON billing_maintenanceinvoice
BEGIN
    SELECT CASE
        WHEN NEW.outstanding_balance < 0.0 THEN
            RAISE(ABORT, 'Integrity Error: Outstanding invoice balance cannot be negative.')
    END;
END;
"""

REVERSE_SQL = """
DROP TRIGGER IF EXISTS trg_prevent_negative_invoice_balance;
DROP VIEW IF EXISTS v_block_occupancy_summary;
DROP VIEW IF EXISTS v_defaulters_ledger;
"""

class Migration(migrations.Migration):
    dependencies = [
        ('billing', '0001_initial'),
        ('properties', '0001_initial'),
        ('residents', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql=SQL_TRIGGERS_AND_VIEWS,
            reverse_sql=REVERSE_SQL
        )
    ]
