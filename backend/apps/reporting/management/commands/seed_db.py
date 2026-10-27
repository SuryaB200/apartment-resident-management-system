import random
from datetime import date, datetime, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction

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

class Command(BaseCommand):
    help = 'Seeds realistic apartment community data for SRM Capstone demonstration'

    def handle(self, *args, **options):
        self.stdout.write("Starting database seeding for CivicQuarters Apartment Management System...")

        with transaction.atomic():
            # 1. System Policies
            settings_data = [
                ('MAX_PARKING_SLOTS_PER_FLAT', '2', 'PARKING', 'Maximum allowed active parking bay allocations per flat'),
                ('LATE_FEE_PERCENTAGE', '5.0', 'FINANCE', 'Percentage surcharge added to overdue maintenance bills'),
                ('LATE_FEE_GRACE_DAYS', '5', 'FINANCE', 'Grace period days past invoice due date before penalty triggers'),
                ('SLA_EMERGENCY_HOURS', '2', 'MAINTENANCE', 'Target turnaround time in hours for Emergency maintenance tickets'),
                ('SLA_HIGH_HOURS', '8', 'MAINTENANCE', 'Target turnaround time in hours for High priority tickets'),
                ('SLA_MEDIUM_HOURS', '24', 'MAINTENANCE', 'Target turnaround time in hours for Medium priority tickets'),
                ('SLA_LOW_HOURS', '48', 'MAINTENANCE', 'Target turnaround time in hours for Low priority tickets'),
                ('SOCIETY_NAME', 'Greenwood Crest Residency', 'SOCIETY', 'Official residential society title'),
                ('SOCIETY_ADDRESS', 'Tiruchirappalli - 620024, Tamil Nadu, India', 'SOCIETY', 'Campus postal address'),
            ]
            for key, val, cat, desc in settings_data:
                SystemSetting.objects.update_or_create(key=key, defaults={'value': val, 'category': cat, 'description': desc})

            # Late fee policy
            policy, _ = LateFeePolicy.objects.update_or_create(
                name='Standard 5% Surcharge Policy',
                defaults={
                    'policy_type': 'PERCENTAGE',
                    'rate_or_amount': Decimal('5.00'),
                    'grace_period_days': 5,
                    'is_active': True
                }
            )

            # 2. Users and Staff
            admin_user, _ = User.objects.update_or_create(
                username='admin',
                defaults={
                    'email': 'admin@greenwoodcrest.org',
                    'first_name': 'Surya',
                    'last_name': 'B (Admin)',
                    'role': 'ADMIN',
                    'is_staff': True,
                    'is_superuser': True,
                    'phone': '+91-98401-23456'
                }
            )
            admin_user.set_password('Admin@123')
            admin_user.save()

            staff_data = [
                ('guard_ramesh', 'Ramesh', 'Kannan', 'SECURITY_GUARD', 'MORNING', 'EMP-SEC-01', '+91-94431-10001'),
                ('guard_suresh', 'Suresh', 'Babu', 'SECURITY_GUARD', 'NIGHT', 'EMP-SEC-02', '+91-94431-10002'),
                ('plumber_kumar', 'Kumar', 'Vel', 'PLUMBER', 'MORNING', 'EMP-PLM-01', '+91-94431-10003'),
                ('electrician_anand', 'Anand', 'Raj', 'ELECTRICIAN', 'MORNING', 'EMP-ELE-01', '+91-94431-10004'),
                ('manager_vijay', 'Vijay', 'Raghavan', 'ESTATE_MANAGER', 'MORNING', 'EMP-MGR-01', '+91-94431-10005'),
            ]

            created_staff = []
            for username, fn, ln, desig, shift, emp_id, phone in staff_data:
                u, _ = User.objects.update_or_create(
                    username=username,
                    defaults={
                        'email': f'{username}@greenwoodcrest.org',
                        'first_name': fn,
                        'last_name': ln,
                        'role': 'STAFF',
                        'phone': phone
                    }
                )
                u.set_password('Staff@123')
                u.save()

                sp, _ = StaffProfile.objects.update_or_create(
                    user=u,
                    defaults={
                        'employee_id': emp_id,
                        'designation': desig,
                        'shift': shift,
                        'phone': phone,
                        'is_available': True
                    }
                )
                created_staff.append(sp)

            # 3. Buildings (Blocks A to D)
            blocks_data = [
                ('Block A - Cedar Wing', 'BLK-A', 10, 'Residential block with North-East facing view'),
                ('Block B - Oak Wing', 'BLK-B', 10, 'Residential block adjacent to clubhouse and pool'),
                ('Block C - Maple Wing', 'BLK-C', 10, 'Residential block overlooking gardens'),
                ('Block D - Pine Wing', 'BLK-D', 10, 'Quiet residential block near sports facilities'),
            ]
            buildings = []
            for bname, bcode, bfloors, bdesc in blocks_data:
                b, _ = Building.objects.update_or_create(
                    code=bcode,
                    defaults={'name': bname, 'total_floors': bfloors, 'description': bdesc}
                )
                buildings.append(b)

            # 4. Amenities
            amenities_data = [
                ('Grand Clubhouse Ballroom', 'AMN-BALLROOM', 'Spacious air-conditioned ballroom with banquet seating and AV stage', 150, Decimal('2500.00'), '08:00', '23:00'),
                ('Community Banquet Hall', 'AMN-BANQUET', 'Multi-purpose party hall suitable for family gatherings and celebrations', 100, Decimal('1500.00'), '09:00', '22:00'),
                ('Floodlit Tennis Court', 'AMN-TENNIS', 'Synthetic turf standard tennis court with night floodlights', 6, Decimal('300.00'), '06:00', '21:00'),
                ('Indoor Badminton Arena', 'AMN-BADMINTON', 'Two-court wooden sprung flooring badminton facility', 12, Decimal('200.00'), '06:00', '22:00'),
                ('Olympic Swimming Pool Deck', 'AMN-POOL', 'Semi-covered Olympic size lap pool with children splash zone', 40, Decimal('100.00'), '06:00', '20:00'),
            ]
            created_amenities = []
            for aname, acode, adesc, acap, arate, aopen, aclose in amenities_data:
                amn, _ = Amenity.objects.update_or_create(
                    code=acode,
                    defaults={
                        'name': aname,
                        'description': adesc,
                        'capacity': acap,
                        'hourly_rate': arate,
                        'opening_time': aopen,
                        'closing_time': aclose,
                        'rules': 'No glass containers. Advance booking required. Mandatory clean-up.'
                    }
                )
                created_amenities.append(amn)

            # 5. Parking Slots
            # Create 120 parking slots across Basement 1 & Basement 2
            parking_slots = []
            for bld in buildings:
                for num in range(1, 31):
                    slot_no = f"P-{bld.code[-1]}{num:02d}"
                    zone = f"Basement 1 - Block {bld.code[-1]}" if num <= 15 else f"Basement 2 - Block {bld.code[-1]}"
                    stype = 'EV_CHARGING' if num in (1, 2) else ('TWO_WHEELER' if num > 25 else 'FOUR_WHEELER')
                    ps, _ = ParkingSlot.objects.update_or_create(
                        slot_number=slot_no,
                        defaults={'location_zone': zone, 'slot_type': stype, 'status': 'AVAILABLE'}
                    )
                    parking_slots.append(ps)

            # 6. Flats (240 Flats total: 60 per block across 10 floors, 6 flats per floor)
            # Exactly matches Stitch KPI: 240 units!
            flats = []
            bhk_distribution = [
                ('1BHK', Decimal('650.00')),
                ('2BHK', Decimal('1150.00')),
                ('2BHK', Decimal('1200.00')),
                ('3BHK', Decimal('1650.00')),
                ('3BHK', Decimal('1800.00')),
                ('4BHK', Decimal('2400.00')),
            ]

            sample_first_names = [
                "Arun", "Priya", "Vikram", "Sneha", "Karthik", "Deepa", "Rahul", "Ananya",
                "Rajesh", "Meera", "Sanjay", "Divya", "Ganesh", "Pooja", "Manoj", "Kavita",
                "Ashok", "Lakshmi", "Harish", "Swathi", "Rohan", "Nisha", "Murali", "Lavanya",
                "Kishore", "Revathi", "Siddharth", "Aarthi", "Pradeep", "Gayathri", "Bala", "Rani"
            ]
            sample_last_names = [
                "Sharma", "Patel", "Iyer", "Reddy", "Nair", "Verma", "Rao", "Menon",
                "Pillai", "Gupta", "Deshmukh", "Sundaram", "Kulkarni", "Balaji", "Subramanian"
            ]

            created_residents = []
            resident_counter = 1

            for bld in buildings:
                for floor in range(1, 11):
                    for unit_idx in range(1, 7):
                        flat_num = f"{bld.code[-1]}-{floor}{unit_idx:02d}"
                        bhk, area = bhk_distribution[(unit_idx - 1) % len(bhk_distribution)]
                        if floor == 10 and unit_idx in (5, 6):
                            bhk = 'PENTHOUSE'
                            area = Decimal('3200.00')

                        flat_obj, _ = Flat.objects.update_or_create(
                            building=bld,
                            flat_number=flat_num,
                            defaults={
                                'floor_number': floor,
                                'bhk_type': bhk,
                                'carpet_area_sqft': area,
                                'occupancy_status': 'VACANT' # will update during occupancy seeding
                            }
                        )
                        flats.append(flat_obj)

            # Let's target exactly 198 occupied flats and 42 vacant flats (matching Stitch UI: 240 units, 198 Occ, 42 Vac)
            occupied_count_target = 198
            random.seed(42) # deterministic for reproducibility
            shuffled_flats = list(flats)
            random.shuffle(shuffled_flats)

            occupied_flats = shuffled_flats[:occupied_count_target]
            vacant_flats = shuffled_flats[occupied_count_target:]

            # Create residents and occupancy history
            tenancies = []
            today = timezone.now().date()

            # Seed specific demo users for testing
            demo_residents = [
                ('resident_arun', 'Arun', 'Sundaram', 'OWNER', '+91-98401-11223', 'arun.sundaram@gmail.com'),
                ('resident_priya', 'Priya', 'Nair', 'TENANT', '+91-98402-33445', 'priya.nair@outlook.com'),
                ('resident_vikram', 'Vikram', 'Iyer', 'TENANT', '+91-98403-55667', 'vikram.iyer@yahoo.com'),
                ('resident_sneha', 'Sneha', 'Reddy', 'OWNER', '+91-98404-77889', 'sneha.reddy@gmail.com'),
            ]
            demo_user_map = {}
            for u_name, fn, ln, rtype, ph, em in demo_residents:
                u, _ = User.objects.update_or_create(
                    username=u_name,
                    defaults={'email': em, 'first_name': fn, 'last_name': ln, 'role': 'RESIDENT', 'phone': ph}
                )
                u.set_password('Resident@123')
                u.save()
                demo_user_map[u_name] = u

            demo_idx = 0
            for idx, flat in enumerate(occupied_flats):
                # Assign resident
                if demo_idx < len(demo_residents):
                    u_key, fn, ln, rtype, ph, em = demo_residents[demo_idx]
                    user_obj = demo_user_map[u_key]
                    demo_idx += 1
                else:
                    fn = sample_first_names[idx % len(sample_first_names)]
                    ln = sample_last_names[(idx + 3) % len(sample_last_names)]
                    rtype = 'TENANT' if (idx % 3 != 0) else 'OWNER'
                    ph = f"+91-9{random.randint(1000, 9999)}-{random.randint(10000, 99999)}"
                    em = f"{fn.lower()}.{ln.lower()}{idx+1}@example.com"
                    user_obj = None

                res_obj, _ = Resident.objects.update_or_create(
                    email=em,
                    defaults={
                        'user': user_obj,
                        'first_name': fn,
                        'last_name': ln,
                        'phone': ph,
                        'resident_type': rtype,
                        'emergency_contact_name': f"{ln} Contact",
                        'emergency_contact_phone': '+91-98765-43210',
                        'id_proof_type': 'AADHAAR',
                        'id_proof_number': f"XXXX-XXXX-{1000 + idx}",
                        'is_active': True
                    }
                )
                created_residents.append(res_obj)

                # Set owner
                flat.current_owner = res_obj if rtype == 'OWNER' else None
                flat.occupancy_status = 'OCCUPIED'
                flat.save()

                # In some flats, simulate past historical tenancy (proving temporal tenancy tracking!)
                if idx < 30:
                    past_res, _ = Resident.objects.update_or_create(
                        email=f"past.tenant{idx}@archive.com",
                        defaults={
                            'first_name': f"Past_{fn}",
                            'last_name': ln,
                            'phone': f"+91-8{random.randint(1000, 9999)}-{random.randint(10000, 99999)}",
                            'resident_type': 'TENANT',
                            'is_active': False
                        }
                    )
                    OccupancyHistory.objects.update_or_create(
                        flat=flat,
                        resident=past_res,
                        defaults={
                            'occupancy_type': 'TENANT',
                            'move_in_date': date(2022, 1, 15) + timedelta(days=idx*5),
                            'move_out_date': date(2023, 6, 30) + timedelta(days=idx*3),
                            'status': 'HISTORICAL',
                            'agreement_reference': f"LEASE-2022-{idx+100}",
                            'rent_amount': Decimal('18000.00'),
                            'deposit_amount': Decimal('50000.00'),
                            'notes': 'Tenancy concluded on lease expiry with full deposit refund.'
                        }
                    )

                # Active current tenancy
                occ_obj, _ = OccupancyHistory.objects.update_or_create(
                    flat=flat,
                    resident=res_obj,
                    defaults={
                        'occupancy_type': rtype,
                        'move_in_date': date(2023, 7, 1) + timedelta(days=(idx % 60)),
                        'move_out_date': None,
                        'status': 'CURRENT',
                        'agreement_reference': f"LEASE-2023-{idx+200}",
                        'rent_amount': Decimal('22000.00') if rtype == 'TENANT' else None,
                        'deposit_amount': Decimal('60000.00') if rtype == 'TENANT' else None,
                        'notes': 'Active authorized resident lease agreement.'
                    }
                )
                tenancies.append(occ_obj)

            # Ensure vacant flats have proper status
            for v_flat in vacant_flats:
                v_flat.occupancy_status = 'VACANT'
                v_flat.save()

            # 7. Invoices & Payments (August, September, October 2024)
            billing_periods = ['2024-08', '2024-09', '2024-10']
            for b_idx, period in enumerate(billing_periods):
                p_year, p_month = map(int, period.split('-'))
                issue_d = date(p_year, p_month, 1)
                due_d = date(p_year, p_month, 15)

                for flat in occupied_flats[:60]: # Seed 60 flats with rich billing history
                    base_rate = (flat.carpet_area_sqft * Decimal('3.50')).quantize(Decimal('0.01'))
                    inv_no = f"INV-{period.replace('-', '')}-{flat.full_flat_code.replace('-', '')}"

                    current_res = flat.occupancy_history.filter(status='CURRENT').first().resident

                    inv, _ = MaintenanceInvoice.objects.update_or_create(
                        flat=flat,
                        billing_period=period,
                        defaults={
                            'invoice_number': inv_no,
                            'resident': current_res,
                            'issue_date': issue_d,
                            'due_date': due_d,
                            'base_amount': base_rate,
                            'late_fee_amount': Decimal('0.00'),
                            'total_amount': base_rate,
                            'amount_paid': Decimal('0.00'),
                            'outstanding_balance': base_rate,
                            'status': 'ISSUED',
                            'notes': f"Monthly society maintenance levy for {period}."
                        }
                    )

                    # Simulate payments
                    if period == '2024-08':
                        # August fully paid
                        Payment.objects.update_or_create(
                            invoice=inv,
                            receipt_number=f"REC-202408-{inv.id}",
                            defaults={
                                'resident': current_res,
                                'amount_paid': base_rate,
                                'payment_date': timezone.now() - timedelta(days=60),
                                'payment_method': random.choice(['UPI', 'NEFT_RTGS', 'CHEQUE']),
                                'transaction_reference': f"UTR-{random.randint(10000000, 99999999)}",
                                'recorded_by': admin_user,
                                'notes': 'August dues settled in full.'
                            }
                        )
                        inv.amount_paid = base_rate
                        inv.outstanding_balance = Decimal('0.00')
                        inv.status = 'PAID'
                        inv.save()

                    elif period == '2024-09':
                        # 80% paid in full, 10% partial, 10% overdue
                        decision = random.random()
                        if decision < 0.8:
                            Payment.objects.update_or_create(
                                invoice=inv,
                                receipt_number=f"REC-202409-{inv.id}",
                                defaults={
                                    'resident': current_res,
                                    'amount_paid': base_rate,
                                    'payment_date': timezone.now() - timedelta(days=30),
                                    'payment_method': 'UPI',
                                    'transaction_reference': f"UPI-{random.randint(10000000, 99999999)}",
                                    'recorded_by': admin_user,
                                    'notes': 'September dues settled.'
                                }
                            )
                            inv.amount_paid = base_rate
                            inv.outstanding_balance = Decimal('0.00')
                            inv.status = 'PAID'
                            inv.save()
                        elif decision < 0.9:
                            part_amt = (base_rate / 2).quantize(Decimal('0.01'))
                            Payment.objects.update_or_create(
                                invoice=inv,
                                receipt_number=f"REC-202409-{inv.id}-PART",
                                defaults={
                                    'resident': current_res,
                                    'amount_paid': part_amt,
                                    'payment_date': timezone.now() - timedelta(days=25),
                                    'payment_method': 'NEFT_RTGS',
                                    'transaction_reference': f"NEFT-{random.randint(10000000, 99999999)}",
                                    'recorded_by': admin_user,
                                    'notes': 'Partial installment received.'
                                }
                            )
                            inv.amount_paid = part_amt
                            inv.outstanding_balance = base_rate - part_amt
                            inv.status = 'PARTIALLY_PAID'
                            inv.save()
                        else:
                            # Overdue with late fee fine!
                            fine = policy.calculate_fine(base_rate)
                            inv.late_fee_amount = fine
                            inv.late_fee_applied = True
                            inv.status = 'OVERDUE'
                            inv.recalculate_totals()
                            inv.save()

                    elif period == '2024-10':
                        # Current cycle: 50% paid, 50% issued
                        if random.random() < 0.5:
                            Payment.objects.update_or_create(
                                invoice=inv,
                                receipt_number=f"REC-202410-{inv.id}",
                                defaults={
                                    'resident': current_res,
                                    'amount_paid': base_rate,
                                    'payment_date': timezone.now() - timedelta(days=2),
                                    'payment_method': 'UPI',
                                    'transaction_reference': f"UPI-{random.randint(10000000, 99999999)}",
                                    'recorded_by': admin_user,
                                    'notes': 'Current month paid.'
                                }
                            )
                            inv.amount_paid = base_rate
                            inv.outstanding_balance = Decimal('0.00')
                            inv.status = 'PAID'
                            inv.save()
                        else:
                            inv.status = 'ISSUED'
                            inv.save()

            # 8. Service Tickets
            ticket_categories = ['PLUMBING', 'ELECTRICAL', 'CARPENTRY', 'HVAC', 'CIVIL']
            ticket_priorities = ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']
            sample_tickets = [
                ("Kitchen sink drain pipe leakage", "Continuous water dripping under kitchen counter affecting cabinet base.", "PLUMBING", "MEDIUM"),
                ("Main MCB tripping repeatedly in evening", "Circuit breaker trips whenever air conditioner and geyser run concurrently.", "ELECTRICAL", "HIGH"),
                ("Balcony sliding door track jammed", "Master bedroom balcony UPVC door rollers stuck and making screeching sound.", "CARPENTRY", "LOW"),
                ("Master bedroom AC low gas cooling issue", "Carrier split AC blowing warm air and not chilling room.", "HVAC", "MEDIUM"),
                ("Ceiling water seepage from upper bathroom", "Moisture and paint peel on bathroom roof originating from flat above.", "CIVIL", "EMERGENCY"),
                ("Intercom handset not buzzing for gate calls", "Security guard unable to connect ring when visitor arrives.", "SECURITY", "HIGH"),
                ("Common corridor bulb fused near elevator", "Hallway dark outside flat entrance.", "ELECTRICAL", "LOW"),
                ("Main waterline low water pressure", "Water flow in overhead shower very feeble in morning hours.", "PLUMBING", "MEDIUM"),
            ]

            plumber_sp = created_staff[2]
            electrician_sp = created_staff[3]

            for s_idx, (ttitle, tdesc, tcat, tprio) in enumerate(sample_tickets):
                target_flat = occupied_flats[s_idx % len(occupied_flats)]
                res = target_flat.occupancy_history.filter(status='CURRENT').first().resident
                assigned_tech = plumber_sp if tcat == 'PLUMBING' else (electrician_sp if tcat == 'ELECTRICAL' else None)

                tkt_status = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'][s_idx % 4]
                open_time = timezone.now() - timedelta(hours=random.randint(5, 72))
                res_time = timezone.now() - timedelta(hours=random.randint(1, 4)) if tkt_status == 'RESOLVED' else None

                tkt, _ = ServiceTicket.objects.update_or_create(
                    ticket_number=f"TKT-202410-{s_idx+101}",
                    defaults={
                        'flat': target_flat,
                        'resident': res,
                        'category': tcat,
                        'priority': tprio,
                        'title': ttitle,
                        'description': tdesc,
                        'status': tkt_status,
                        'assigned_staff': assigned_tech if tkt_status in ('ASSIGNED', 'IN_PROGRESS', 'RESOLVED') else None,
                        'opened_at': open_time,
                        'assigned_at': open_time + timedelta(hours=1) if assigned_tech else None,
                        'in_progress_at': open_time + timedelta(hours=2) if tkt_status in ('IN_PROGRESS', 'RESOLVED') else None,
                        'resolved_at': res_time,
                        'resolution_notes': 'Replaced damaged gasket and verified pressure flow.' if tkt_status == 'RESOLVED' else None,
                        'feedback_rating': 5 if tkt_status == 'RESOLVED' else None
                    }
                )

            # 9. Visitor Logs
            sample_visitors = [
                ("Ramesh Chawla", "+91-98711-22334", "GUEST", "TN-45-AZ-2041", "CHECKED_IN", "Main Gate 01"),
                ("Swiggy Delivery Partner", "+91-98722-33445", "DELIVERY", "TN-45-BK-1122", "CHECKED_OUT", "Main Gate 01"),
                ("Urban Company AC Tech", "+91-98733-44556", "SERVICE", "TN-45-DL-8899", "CHECKED_IN", "Main Gate 02"),
                ("Uber Premier Cab", "+91-98744-55667", "CAB", "TN-45-CA-7700", "CHECKED_OUT", "Main Gate 01"),
                ("Amazon Logistics Courier", "+91-98755-66778", "DELIVERY", "TN-45-EM-3311", "CHECKED_IN", "Main Gate 01"),
                ("Deepak Verma (Architect)", "+91-98766-77889", "OFFICIAL", "TN-45-FA-4455", "CHECKED_IN", "Main Gate 01"),
            ]

            guard_user = created_staff[0].user
            for v_idx, (vname, vphone, vpurp, vveh, vstat, vgate) in enumerate(sample_visitors):
                v_flat = occupied_flats[(v_idx * 3) % len(occupied_flats)]
                v_res = v_flat.occupancy_history.filter(status='CURRENT').first().resident
                chk_in = timezone.now() - timedelta(minutes=random.randint(15, 180))
                chk_out = chk_in + timedelta(minutes=random.randint(10, 45)) if vstat == 'CHECKED_OUT' else None

                VisitorLog.objects.update_or_create(
                    pass_number=f"VIS-202410-{v_idx+1001}",
                    defaults={
                        'visitor_name': vname,
                        'phone_number': vphone,
                        'destination_flat': v_flat,
                        'resident_host': v_res,
                        'purpose': vpurp,
                        'vehicle_number': vveh,
                        'check_in_time': chk_in,
                        'check_out_time': chk_out,
                        'status': vstat,
                        'gate_name': vgate,
                        'guard_user': guard_user,
                        'notes': 'Entry cleared via intercom phone confirmation.'
                    }
                )

            # 10. Amenity Bookings
            booking_samples = [
                (created_amenities[0], occupied_flats[0], date(today.year, today.month, 22), '18:00:00', '22:00:00', 80, Decimal('10000.00'), 'Family 25th Wedding Anniversary Dinner'),
                (created_amenities[1], occupied_flats[1], date(today.year, today.month, 25), '10:00:00', '14:00:00', 50, Decimal('6000.00'), 'Kids Birthday Party with Magic Show'),
                (created_amenities[2], occupied_flats[2], date(today.year, today.month, 20), '06:00:00', '08:00:00', 4, Decimal('600.00'), 'Morning doubles tournament practice'),
                (created_amenities[3], occupied_flats[3], date(today.year, today.month, 21), '19:00:00', '21:00:00', 8, Decimal('400.00'), 'Society youth league match'),
            ]

            for b_idx, (b_amn, b_flat, b_date, b_st, b_et, b_att, b_tot, b_notes) in enumerate(booking_samples):
                b_res = b_flat.occupancy_history.filter(status='CURRENT').first().resident
                AmenityBooking.objects.update_or_create(
                    booking_reference=f"BKG-202410-{b_idx+101}",
                    defaults={
                        'amenity': b_amn,
                        'resident': b_res,
                        'flat': b_flat,
                        'booking_date': b_date,
                        'start_time': b_st,
                        'end_time': b_et,
                        'attendees_count': b_att,
                        'total_charge': b_tot,
                        'status': 'CONFIRMED',
                        'notes': b_notes
                    }
                )

            # 11. Parking Allocations
            for p_idx, flat in enumerate(occupied_flats[:45]):
                slot = parking_slots[p_idx]
                res = flat.occupancy_history.filter(status='CURRENT').first().resident
                v_num = f"TN-45-AB-{2000 + p_idx}"
                v_type = 'CAR' if slot.slot_type in ('FOUR_WHEELER', 'EV_CHARGING') else 'BIKE'

                ParkingAllocation.objects.update_or_create(
                    slot=slot,
                    defaults={
                        'flat': flat,
                        'resident': res,
                        'vehicle_number': v_num,
                        'vehicle_make_model': 'Hyundai Creta' if p_idx % 2 == 0 else 'Tata Nexon EV',
                        'vehicle_type': v_type,
                        'allocated_at': timezone.now() - timedelta(days=90),
                        'is_active': True,
                        'notes': 'Designated primary residential parking allotment.'
                    }
                )
                slot.status = 'ALLOCATED'
                slot.save()

            # 12. Audit Logs
            AuditLog.objects.create(
                acting_user=admin_user,
                action='CREATE',
                entity_type='Building',
                record_id='ALL',
                details='Initial taxonomy master setup: Blocks A through D registered (240 units total)',
                ip_address='127.0.0.1'
            )
            AuditLog.objects.create(
                acting_user=admin_user,
                action='BILLING_TRIGGER_RUN',
                entity_type='MaintenanceInvoice',
                record_id='CYCLE-202410',
                details='Automated monthly billing engine executed for October 2024 billing cycle',
                ip_address='127.0.0.1'
            )
            AuditLog.objects.create(
                acting_user=guard_user,
                action='GATE_CHECKIN',
                entity_type='VisitorLog',
                record_id='VIS-202410-1001',
                details='Fast gate check-in logged for visitor Ramesh Chawla -> Flat A-101',
                ip_address='192.168.1.50'
            )

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
        self.stdout.write(self.style.SUCCESS("Created 240 Flats across Blocks A-D (198 Occupied, 42 Vacant)"))
        self.stdout.write(self.style.SUCCESS("Created Users: admin (pass: Admin@123), resident_arun (pass: Resident@123), guard_ramesh (pass: Staff@123)"))
