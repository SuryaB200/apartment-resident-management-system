-- ============================================================================
-- APARTMENT & RESIDENT MANAGEMENT SYSTEM
-- File 03: Realistic Demonstration Seed Data (SQL Inserts)
-- SRM DBMS Capstone Project (Tiruchirappalli)
-- ============================================================================

-- 1. BUILDINGS
INSERT INTO properties_building (id, building_code, name, total_floors, description) VALUES
(1, 'BLK-A', 'Aster Tower (Block A)', 15, 'Executive tower overlooking eastern gardens.'),
(2, 'BLK-B', 'Begonia Tower (Block B)', 15, 'Residential suites with western skyline views.'),
(3, 'BLK-C', 'Carnation Tower (Block C)', 15, 'Centrally located tower near clubhouse.'),
(4, 'BLK-D', 'Dahlia Tower (Block D)', 15, 'North pavilion residential units.')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. LATE FEE POLICY
INSERT INTO billing_latefeepolicy (id, policy_name, grace_period_days, late_fee_percentage, is_active) VALUES
(1, 'Standard Monthly Late Fine (5% post 5-day grace)', 5, 5.00, TRUE)
ON DUPLICATE KEY UPDATE policy_name=VALUES(policy_name);

-- 3. AMENITIES
INSERT INTO amenities_amenity (id, name, code, capacity, hourly_rate, is_operational) VALUES
(1, 'Grand Banquet & Celebration Hall', 'BANQUET-01', 120, 1500.00, TRUE),
(2, 'Community Clubhouse & Lounge', 'CLUBHOUSE-01', 50, 500.00, TRUE),
(3, 'Indoor Badminton Arena (Court 1)', 'BADMINTON-01', 4, 150.00, TRUE),
(4, 'Indoor Badminton Arena (Court 2)', 'BADMINTON-02', 4, 150.00, TRUE),
(5, 'Outdoor Floodlit Tennis Court', 'TENNIS-01', 4, 250.00, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. PARKING SLOTS (Sample)
INSERT INTO parking_parkingslot (id, slot_number, location_zone, slot_type, status) VALUES
(1, 'B1-A01', 'Basement Level 1 - Sector A', 'FOUR_WHEELER', 'AVAILABLE'),
(2, 'B1-A02', 'Basement Level 1 - Sector A', 'FOUR_WHEELER', 'AVAILABLE'),
(3, 'B1-A03', 'Basement Level 1 - Sector A', 'FOUR_WHEELER', 'AVAILABLE'),
(4, 'B1-A04', 'Basement Level 1 - Sector A', 'TWO_WHEELER', 'AVAILABLE'),
(5, 'B1-A05', 'Basement Level 1 - Sector A', 'EV_CHARGING', 'AVAILABLE')
ON DUPLICATE KEY UPDATE slot_number=VALUES(slot_number);
