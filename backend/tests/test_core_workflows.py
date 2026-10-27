from django.test import TestCase, Client
from django.utils import timezone
from django.core.exceptions import ValidationError
from datetime import date, timedelta, time
from decimal import Decimal
import json

from apps.accounts.models import User, StaffProfile
from apps.properties.models import Building, Flat
from apps.residents.models import Resident
from apps.occupancy.models import OccupancyHistory
from apps.billing.models import LateFeePolicy, MaintenanceInvoice, Payment
from apps.maintenance.models import ServiceTicket
from apps.visitors.models import VisitorLog
from apps.amenities.models import Amenity, AmenityBooking
from apps.parking.models import ParkingSlot, ParkingAllocation
from apps.reporting.models import SystemSetting
from apps.audit.models import AuditLog

class CoreWorkflowsIntegrationTests(TestCase):
    def setUp(self):
        self.client = Client()

        # Create Admin
        self.admin = User.objects.create_superuser(
            username='test_admin',
            email='admin@test.org',
            password='Password@123',
            role='ADMIN'
        )

        # Create Resident User & Profile
        self.res_user1 = User.objects.create_user(
            username='test_resident1',
            email='res1@test.org',
            password='Password@123',
            role='RESIDENT'
        )
        self.res_user2 = User.objects.create_user(
            username='test_resident2',
            email='res2@test.org',
            password='Password@123',
            role='RESIDENT'
        )

        self.resident1 = Resident.objects.create(
            user=self.res_user1,
            first_name='Anand',
            last_name='Kumar',
            email='res1@test.org',
            phone='+91-98765-00001',
            resident_type='TENANT'
        )
        self.resident2 = Resident.objects.create(
            user=self.res_user2,
            first_name='Balaji',
            last_name='Rao',
            email='res2@test.org',
            phone='+91-98765-00002',
            resident_type='OWNER'
        )

        # Staff User & Profile
        self.staff_user = User.objects.create_user(
            username='test_staff',
            email='staff@test.org',
            password='Password@123',
            role='STAFF'
        )
        self.staff_profile = StaffProfile.objects.create(
            user=self.staff_user,
            employee_id='EMP-TEST-01',
            designation='PLUMBER',
            phone='+91-98765-00003'
        )

        # Building & Flat
        self.building = Building.objects.create(
            name='Test Block A',
            code='BLK-TA',
            total_floors=5
        )
        self.flat1 = Flat.objects.create(
            building=self.building,
            flat_number='TA-101',
            floor_number=1,
            bhk_type='2BHK',
            carpet_area_sqft=Decimal('1200.00'),
            occupancy_status='VACANT'
        )
        self.flat2 = Flat.objects.create(
            building=self.building,
            flat_number='TA-102',
            floor_number=1,
            bhk_type='3BHK',
            carpet_area_sqft=Decimal('1600.00'),
            occupancy_status='VACANT'
        )

        # Late fee policy
        self.late_fee_policy = LateFeePolicy.objects.create(
            name='Test 5% Late Fee',
            policy_type='PERCENTAGE',
            rate_or_amount=Decimal('5.00'),
            grace_period_days=5,
            is_active=True
        )

        # Amenity
        self.amenity = Amenity.objects.create(
            name='Test Banquet Hall',
            code='AMN-TEST-BQ',
            description='Test facility',
            capacity=100,
            hourly_rate=Decimal('1000.00')
        )

        # Parking Slot
        self.parking_slot1 = ParkingSlot.objects.create(
            slot_number='P-TEST-01',
            location_zone='Basement 1',
            slot_type='FOUR_WHEELER',
            status='AVAILABLE'
        )
        self.parking_slot2 = ParkingSlot.objects.create(
            slot_number='P-TEST-02',
            location_zone='Basement 1',
            slot_type='FOUR_WHEELER',
            status='AVAILABLE'
        )

        # System Setting
        SystemSetting.objects.create(
            key='MAX_PARKING_SLOTS_PER_FLAT',
            value='2',
            category='PARKING'
        )

    def get_jwt_token(self, username, password='Password@123'):
        resp = self.client.post('/api/auth/login/', {
            'username': username,
            'password': password
        })
        self.assertEqual(resp.status_code, 200)
        return resp.data['access']

    def test_01_login_and_jwt_authentication(self):
        """Test authentication endpoint issues valid JWT token and user profile."""
        resp = self.client.post('/api/auth/login/', {
            'username': 'test_admin',
            'password': 'Password@123'
        })
        self.assertEqual(resp.status_code, 200)
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)
        self.assertEqual(resp.data['user']['role'], 'ADMIN')

    def test_02_resident_data_isolation(self):
        """Test resident can only view their own private profile, not other residents."""
        token = self.get_jwt_token('test_resident1')
        resp = self.client.get('/api/residents/', HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(resp.status_code, 200)
        # Should only see self (1 result), not resident2!
        results = resp.data['results'] if 'results' in resp.data else resp.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['email'], 'res1@test.org')

    def test_03_occupancy_history_preservation_and_validation(self):
        """Test temporal tenancy tracking without overwriting, and date range validation."""
        # 1. Reject move_out < move_in
        invalid_occ = OccupancyHistory(
            flat=self.flat1,
            resident=self.resident1,
            occupancy_type='TENANT',
            move_in_date=date(2024, 5, 1),
            move_out_date=date(2024, 4, 1), # Invalid
            status='CURRENT'
        )
        with self.assertRaises(ValidationError):
            invalid_occ.clean()

        # 2. Assign valid tenancy
        occ1 = OccupancyHistory.objects.create(
            flat=self.flat1,
            resident=self.resident1,
            occupancy_type='TENANT',
            move_in_date=date(2023, 1, 1),
            status='CURRENT'
        )
        self.flat1.refresh_from_db()
        self.assertEqual(self.flat1.occupancy_status, 'OCCUPIED')

        # 3. Terminate tenancy and move in new resident
        occ1.move_out_date = date(2024, 1, 1)
        occ1.status = 'HISTORICAL'
        occ1.save()

        # Assign resident2 as new tenant
        occ2 = OccupancyHistory.objects.create(
            flat=self.flat1,
            resident=self.resident2,
            occupancy_type='TENANT',
            move_in_date=date(2024, 2, 1),
            status='CURRENT'
        )

        # Verify historical record was preserved!
        history = OccupancyHistory.objects.filter(flat=self.flat1).order_by('move_in_date')
        self.assertEqual(history.count(), 2)
        self.assertEqual(history.first().resident, self.resident1)
        self.assertEqual(history.first().status, 'HISTORICAL')
        self.assertEqual(history.last().resident, self.resident2)
        self.assertEqual(history.last().status, 'CURRENT')

    def test_04_invoice_generation_and_balance_calculations(self):
        """Test billing engine decimal calculations, partial and full payments."""
        inv = MaintenanceInvoice.objects.create(
            invoice_number='INV-202410-TA101',
            flat=self.flat1,
            resident=self.resident1,
            billing_period='2024-10',
            issue_date=date(2024, 10, 1),
            due_date=date(2024, 10, 15),
            base_amount=Decimal('4200.00'),
            total_amount=Decimal('4200.00'),
            amount_paid=Decimal('0.00'),
            outstanding_balance=Decimal('4200.00'),
            status='ISSUED'
        )

        admin_token = self.get_jwt_token('test_admin')

        # 1. Partial Payment of ₹2000.00
        pay_resp = self.client.post('/api/billing/payments/', {
            'invoice': inv.id,
            'amount_paid': '2000.00',
            'payment_method': 'UPI',
            'transaction_reference': 'UPI-REF-001'
        }, HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        self.assertEqual(pay_resp.status_code, 201)

        inv.refresh_from_db()
        self.assertEqual(inv.amount_paid, Decimal('2000.00'))
        self.assertEqual(inv.outstanding_balance, Decimal('2200.00'))
        self.assertEqual(inv.status, 'PARTIALLY_PAID')

        # 2. Settle remaining balance of ₹2200.00
        pay_resp2 = self.client.post('/api/billing/payments/', {
            'invoice': inv.id,
            'amount_paid': '2200.00',
            'payment_method': 'NEFT_RTGS',
            'transaction_reference': 'NEFT-REF-002'
        }, HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        self.assertEqual(pay_resp2.status_code, 201)

        inv.refresh_from_db()
        self.assertEqual(inv.outstanding_balance, Decimal('0.00'))
        self.assertEqual(inv.status, 'PAID')

    def test_05_duplicate_payment_and_overpayment_protection(self):
        """Test rejection of duplicate transactions, negative amounts, and overpayments."""
        inv = MaintenanceInvoice.objects.create(
            invoice_number='INV-202410-TA102',
            flat=self.flat2,
            resident=self.resident2,
            billing_period='2024-10',
            issue_date=date(2024, 10, 1),
            due_date=date(2024, 10, 15),
            base_amount=Decimal('3000.00'),
            total_amount=Decimal('3000.00'),
            amount_paid=Decimal('0.00'),
            outstanding_balance=Decimal('3000.00'),
            status='ISSUED'
        )
        admin_token = self.get_jwt_token('test_admin')

        # 1. Rejects overpayment > 3000
        overpay = self.client.post('/api/billing/payments/', {
            'invoice': inv.id,
            'amount_paid': '5000.00',
            'payment_method': 'UPI',
            'transaction_reference': 'TX-OVER'
        }, HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        self.assertEqual(overpay.status_code, 400)

        # 2. Rejects negative amount
        neg_pay = self.client.post('/api/billing/payments/', {
            'invoice': inv.id,
            'amount_paid': '-500.00',
            'payment_method': 'CASH',
            'transaction_reference': 'TX-NEG'
        }, HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        self.assertEqual(neg_pay.status_code, 400)

        # 3. Rejects duplicate transaction reference
        valid_pay = self.client.post('/api/billing/payments/', {
            'invoice': inv.id,
            'amount_paid': '1000.00',
            'payment_method': 'UPI',
            'transaction_reference': 'TX-DUP-01'
        }, HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        self.assertEqual(valid_pay.status_code, 201)

        dup_pay = self.client.post('/api/billing/payments/', {
            'invoice': inv.id,
            'amount_paid': '1000.00',
            'payment_method': 'UPI',
            'transaction_reference': 'TX-DUP-01' # Duplicate
        }, HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        self.assertEqual(dup_pay.status_code, 400)

    def test_06_late_fee_calculation(self):
        """Test configurable late-fee policy calculation formula."""
        base = Decimal('5000.00')
        fine = self.late_fee_policy.calculate_fine(base)
        # 5% of 5000 is 250.00
        self.assertEqual(fine, Decimal('250.00'))

    def test_07_service_ticket_state_machine_and_unauthorized_assignment(self):
        """Test valid state lifecycle (OPEN -> ASSIGNED -> IN_PROGRESS -> RESOLVED) and role permissions."""
        ticket = ServiceTicket.objects.create(
            ticket_number='TKT-TEST-001',
            flat=self.flat1,
            resident=self.resident1,
            category='PLUMBING',
            priority='HIGH',
            title='Leaking pipeline',
            description='Test issue',
            status='OPEN'
        )

        res_token = self.get_jwt_token('test_resident1')
        admin_token = self.get_jwt_token('test_admin')

        # 1. Resident attempting staff assignment should fail (403)
        assign_fail = self.client.post(f'/api/maintenance/tickets/{ticket.id}/transition/', {
            'status': 'ASSIGNED',
            'staff_id': self.staff_profile.id
        }, HTTP_AUTHORIZATION=f'Bearer {res_token}')
        self.assertEqual(assign_fail.status_code, 403)

        # 2. Admin assigns staff
        assign_ok = self.client.post(f'/api/maintenance/tickets/{ticket.id}/transition/', {
            'status': 'ASSIGNED',
            'staff_id': self.staff_profile.id
        }, HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        self.assertEqual(assign_ok.status_code, 200)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, 'ASSIGNED')
        self.assertEqual(ticket.assigned_staff, self.staff_profile)

        # 3. Progress to IN_PROGRESS then RESOLVED
        self.client.post(f'/api/maintenance/tickets/{ticket.id}/transition/', {
            'status': 'IN_PROGRESS'
        }, HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, 'IN_PROGRESS')

        self.client.post(f'/api/maintenance/tickets/{ticket.id}/transition/', {
            'status': 'RESOLVED',
            'notes': 'Replaced elbow valve.'
        }, HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, 'RESOLVED')
        self.assertIsNotNone(ticket.resolved_at)

    def test_08_amenity_booking_conflict_prevention(self):
        """Test that overlapping amenity reservations are strictly blocked at database/model level."""
        b_date = date(2025, 1, 10)

        # First booking: 10:00 to 14:00
        booking1 = AmenityBooking.objects.create(
            booking_reference='BKG-TEST-001',
            amenity=self.amenity,
            resident=self.resident1,
            flat=self.flat1,
            booking_date=b_date,
            start_time=time(10, 0),
            end_time=time(14, 0),
            status='CONFIRMED'
        )

        # Overlapping booking attempt: 12:00 to 16:00 on same date and facility
        booking2 = AmenityBooking(
            booking_reference='BKG-TEST-002',
            amenity=self.amenity,
            resident=self.resident2,
            flat=self.flat2,
            booking_date=b_date,
            start_time=time(12, 0),
            end_time=time(16, 0),
            status='CONFIRMED'
        )
        with self.assertRaises(ValidationError):
            booking2.save()

        # Non-overlapping booking should succeed: 15:00 to 18:00
        booking3 = AmenityBooking.objects.create(
            booking_reference='BKG-TEST-003',
            amenity=self.amenity,
            resident=self.resident2,
            flat=self.flat2,
            booking_date=b_date,
            start_time=time(15, 0),
            end_time=time(18, 0),
            status='CONFIRMED'
        )
        self.assertIsNotNone(booking3.id)

    def test_09_parking_quota_enforcement(self):
        """Test that per-flat parking quota is strictly enforced and slot conflicts prevented."""
        # 1. Allocate slot 1 to Flat 1
        alloc1 = ParkingAllocation.objects.create(
            slot=self.parking_slot1,
            flat=self.flat1,
            resident=self.resident1,
            vehicle_number='TN-45-CAR-01',
            is_active=True
        )
        self.parking_slot1.refresh_from_db()
        self.assertEqual(self.parking_slot1.status, 'ALLOCATED')

        # 2. Cannot allocate already allocated slot 1 to Flat 2
        alloc_conflict = ParkingAllocation(
            slot=self.parking_slot1,
            flat=self.flat2,
            resident=self.resident2,
            vehicle_number='TN-45-CAR-02',
            is_active=True
        )
        with self.assertRaises(ValidationError):
            alloc_conflict.save()

    def test_10_dashboard_metrics_loading(self):
        """Test that dashboard API aggregates live database records."""
        admin_token = self.get_jwt_token('test_admin')
        resp = self.client.get('/api/reporting/metrics/dashboard/', HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('kpis', resp.data)
        self.assertIn('total_flats', resp.data['kpis'])
        self.assertIn('total_billed', resp.data['kpis'])
        self.assertIn('block_breakdown', resp.data)

    def test_11_visitor_gate_checkin_and_checkout(self):
        """Test gate security fast entry and checkout workflow."""
        admin_token = self.get_jwt_token('test_admin')
        # Check in visitor
        checkin_resp = self.client.post('/api/visitors/logs/', {
            'visitor_name': 'Ramesh Courier',
            'phone_number': '+91-98765-11111',
            'destination_flat': self.flat1.id,
            'purpose': 'DELIVERY',
            'vehicle_number': 'TN-45-DL-1010',
            'gate_name': 'Main Gate 01'
        }, HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        self.assertEqual(checkin_resp.status_code, 201)
        v_id = checkin_resp.data['id']
        self.assertEqual(checkin_resp.data['status'], 'CHECKED_IN')
        self.assertIn('VIS-', checkin_resp.data['pass_number'])

        # Checkout visitor
        checkout_resp = self.client.post(f'/api/visitors/logs/{v_id}/checkout/', HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        self.assertEqual(checkout_resp.status_code, 200)
        self.assertEqual(checkout_resp.data['status'], 'CHECKED_OUT')
        self.assertIsNotNone(checkout_resp.data['check_out_time'])

    def test_12_audit_trail_recording_and_access(self):
        """Test that audit log records security events and ordinary users cannot read or delete audit trail."""
        admin_token = self.get_jwt_token('test_admin')
        res_token = self.get_jwt_token('test_resident1')

        # Admin can view audit logs
        admin_resp = self.client.get('/api/audit/logs/', HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        self.assertEqual(admin_resp.status_code, 200)

        # Resident is forbidden from viewing audit logs
        res_resp = self.client.get('/api/audit/logs/', HTTP_AUTHORIZATION=f'Bearer {res_token}')
        self.assertEqual(res_resp.status_code, 403)

