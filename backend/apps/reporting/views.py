from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, Q, F
from django.utils import timezone
from datetime import datetime, timedelta, date
from decimal import Decimal

from .models import SystemSetting
from .serializers import SystemSettingSerializer
from apps.properties.models import Flat, Building
from apps.residents.models import Resident
from apps.occupancy.models import OccupancyHistory
from apps.billing.models import MaintenanceInvoice, Payment
from apps.maintenance.models import ServiceTicket
from apps.visitors.models import VisitorLog
from apps.amenities.models import Amenity, AmenityBooking
from apps.parking.models import ParkingSlot, ParkingAllocation
from apps.audit.models import AuditLog
from apps.accounts.models import StaffProfile

class SystemSettingViewSet(viewsets.ModelViewSet):
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        return qs


class DashboardMetricsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        start_of_today = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)

        # 1. Flat & Resident Counts
        total_flats = Flat.objects.count()
        occupied_flats = Flat.objects.filter(occupancy_status='OCCUPIED').count()
        vacant_flats = Flat.objects.filter(occupancy_status='VACANT').count()
        maint_flats = Flat.objects.filter(occupancy_status='MAINTENANCE').count()
        occupancy_rate = round((occupied_flats / total_flats * 100), 1) if total_flats > 0 else 0.0

        active_residents = Resident.objects.filter(is_active=True).count()
        active_tenants = Resident.objects.filter(is_active=True, resident_type='TENANT').count()
        active_owners = Resident.objects.filter(is_active=True, resident_type='OWNER').count()

        # 2. Financial Metrics
        billing_agg = MaintenanceInvoice.objects.aggregate(
            total_billed=Sum('total_amount'),
            total_collected=Sum('amount_paid'),
            total_outstanding=Sum('outstanding_balance')
        )
        total_billed = billing_agg['total_billed'] or Decimal('0.00')
        total_collected = billing_agg['total_collected'] or Decimal('0.00')
        total_outstanding = billing_agg['total_outstanding'] or Decimal('0.00')

        overdue_invoices_qs = MaintenanceInvoice.objects.filter(status='OVERDUE', outstanding_balance__gt=0)
        overdue_invoices_count = overdue_invoices_qs.count()
        overdue_amount = overdue_invoices_qs.aggregate(val=Sum('outstanding_balance'))['val'] or Decimal('0.00')

        # 3. Tickets & SLA Metrics
        open_tickets = ServiceTicket.objects.filter(status__in=['OPEN', 'ASSIGNED', 'IN_PROGRESS']).count()
        resolved_tickets = ServiceTicket.objects.filter(status__in=['RESOLVED', 'CLOSED']).count()

        delayed_tickets_count = 0
        all_active_tickets = ServiceTicket.objects.filter(status__in=['OPEN', 'ASSIGNED', 'IN_PROGRESS'])
        for tkt in all_active_tickets:
            if tkt.is_sla_breached:
                delayed_tickets_count += 1

        # 4. Gate Security Metrics
        visitors_checked_in_today = VisitorLog.objects.filter(check_in_time__gte=start_of_today).count()
        visitors_active_on_campus = VisitorLog.objects.filter(status='CHECKED_IN').count()

        # 5. Facility Bookings
        upcoming_bookings_count = AmenityBooking.objects.filter(
            booking_date__gte=today, status='CONFIRMED'
        ).count()

        # 6. Parking Stats
        total_parking = ParkingSlot.objects.count()
        available_parking = ParkingSlot.objects.filter(status='AVAILABLE').count()
        allocated_parking = ParkingSlot.objects.filter(status='ALLOCATED').count()

        # 7. Block-by-block breakdown
        buildings = Building.objects.all()
        block_breakdown = []
        for bld in buildings:
            b_total = bld.flats.count()
            b_occ = bld.flats.filter(occupancy_status='OCCUPIED').count()
            b_vac = b_total - b_occ
            pct = round((b_occ / b_total * 100), 1) if b_total > 0 else 0.0
            block_breakdown.append({
                'id': bld.id,
                'name': bld.name,
                'code': bld.code,
                'total': b_total,
                'occupied': b_occ,
                'vacant': b_vac,
                'occupancy_pct': pct,
            })

        # 8. Recent Activities
        recent_payments = Payment.objects.select_related('invoice__flat__building', 'resident').order_by('-payment_date')[:5]
        recent_payments_data = [
            {
                'id': p.id,
                'receipt_number': p.receipt_number,
                'flat_code': p.invoice.flat.full_flat_code,
                'resident_name': p.resident.full_name if p.resident else 'N/A',
                'amount': str(p.amount_paid),
                'method': p.payment_method,
                'date': p.payment_date.strftime('%Y-%m-%d %H:%M'),
            } for p in recent_payments
        ]

        recent_visitors = VisitorLog.objects.select_related('destination_flat__building').order_by('-check_in_time')[:5]
        recent_visitors_data = [
            {
                'id': v.id,
                'pass_number': v.pass_number,
                'name': v.visitor_name,
                'phone': v.phone_number,
                'flat_code': v.destination_flat.full_flat_code,
                'purpose': v.get_purpose_display(),
                'status': v.status,
                'time': v.check_in_time.strftime('%H:%M'),
                'vehicle': v.vehicle_number or 'Pedestrian',
            } for v in recent_visitors
        ]

        recent_bookings = AmenityBooking.objects.select_related('amenity', 'flat__building', 'resident').filter(
            booking_date__gte=today, status='CONFIRMED'
        ).order_by('booking_date', 'start_time')[:5]
        recent_bookings_data = [
            {
                'id': b.id,
                'ref': b.booking_reference,
                'amenity': b.amenity.name,
                'flat_code': b.flat.full_flat_code,
                'resident': b.resident.full_name,
                'date': b.booking_date.strftime('%Y-%m-%d'),
                'time': f"{b.start_time.strftime('%H:%M')} - {b.end_time.strftime('%H:%M')}",
            } for b in recent_bookings
        ]

        recent_audits = AuditLog.objects.select_related('acting_user').order_by('-timestamp')[:6]
        recent_audits_data = [
            {
                'id': a.id,
                'user': a.acting_user.username if a.acting_user else 'System Trigger',
                'action': a.get_action_display(),
                'entity': a.entity_type,
                'record_id': a.record_id,
                'details': a.details,
                'timestamp': a.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            } for a in recent_audits
        ]

        return Response({
            'kpis': {
                'total_flats': total_flats,
                'occupied_flats': occupied_flats,
                'vacant_flats': vacant_flats,
                'maint_flats': maint_flats,
                'occupancy_rate': occupancy_rate,
                'active_residents': active_residents,
                'active_tenants': active_tenants,
                'active_owners': active_owners,
                'total_billed': str(total_billed),
                'total_collected': str(total_collected),
                'total_outstanding': str(total_outstanding),
                'overdue_invoices_count': overdue_invoices_count,
                'overdue_amount': str(overdue_amount),
                'open_tickets': open_tickets,
                'resolved_tickets': resolved_tickets,
                'delayed_tickets': delayed_tickets_count,
                'visitors_today': visitors_checked_in_today,
                'visitors_on_campus': visitors_active_on_campus,
                'upcoming_bookings': upcoming_bookings_count,
                'total_parking': total_parking,
                'available_parking': available_parking,
                'allocated_parking': allocated_parking,
            },
            'block_breakdown': block_breakdown,
            'recent_payments': recent_payments_data,
            'recent_visitors': recent_visitors_data,
            'recent_bookings': recent_bookings_data,
            'recent_audits': recent_audits_data,
        })


class DefaultersLedgerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Returns normalized Defaulters Ledger with total arrears, overdue periods, and aging."""
        today = timezone.now().date()
        unpaid_invoices = MaintenanceInvoice.objects.filter(
            outstanding_balance__gt=Decimal('0.00')
        ).select_related('flat__building', 'resident')

        # Aggregate by flat
        flat_map = {}
        for inv in unpaid_invoices:
            flat_id = inv.flat.id
            if flat_id not in flat_map:
                flat_map[flat_id] = {
                    'flat_id': flat_id,
                    'flat_code': inv.flat.full_flat_code,
                    'building_name': inv.flat.building.name,
                    'resident_name': inv.resident.full_name if inv.resident else (inv.flat.current_owner.full_name if inv.flat.current_owner else 'Unassigned'),
                    'phone': inv.resident.phone if inv.resident else (inv.flat.current_owner.phone if inv.flat.current_owner else 'N/A'),
                    'email': inv.resident.email if inv.resident else (inv.flat.current_owner.email if inv.flat.current_owner else 'N/A'),
                    'total_outstanding': Decimal('0.00'),
                    'overdue_invoices_count': 0,
                    'total_invoices_count': 0,
                    'oldest_due_date': inv.due_date,
                    'periods': [],
                }
            item = flat_map[flat_id]
            item['total_outstanding'] += inv.outstanding_balance
            item['total_invoices_count'] += 1
            if inv.status == 'OVERDUE' or inv.due_date < today:
                item['overdue_invoices_count'] += 1
            if inv.due_date < item['oldest_due_date']:
                item['oldest_due_date'] = inv.due_date
            item['periods'].append(inv.billing_period)

        defaulters = list(flat_map.values())
        # Calculate aging days and convert decimals
        for d in defaulters:
            delta_days = (today - d['oldest_due_date']).days if today > d['oldest_due_date'] else 0
            d['overdue_days'] = delta_days
            d['oldest_due_date'] = d['oldest_due_date'].isoformat()
            d['total_outstanding'] = str(d['total_outstanding'])

        # Sort by total outstanding descending
        defaulters.sort(key=lambda x: Decimal(x['total_outstanding']), reverse=True)

        return Response({
            'total_defaulters_count': len(defaulters),
            'defaulters': defaulters
        })


class SLAReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        staff_list = StaffProfile.objects.select_related('user').all()
        staff_stats = []

        for staff in staff_list:
            tickets = ServiceTicket.objects.filter(assigned_staff=staff)
            total_assigned = tickets.count()
            resolved = tickets.filter(status__in=['RESOLVED', 'CLOSED'])
            resolved_count = resolved.count()
            open_count = tickets.filter(status__in=['ASSIGNED', 'IN_PROGRESS']).count()

            breached_count = 0
            turnaround_sum = 0.0
            for t in resolved:
                turnaround_sum += t.turnaround_hours
                if t.is_sla_breached:
                    breached_count += 1

            avg_tat = round(turnaround_sum / resolved_count, 1) if resolved_count > 0 else 0.0

            staff_stats.append({
                'id': staff.id,
                'employee_id': staff.employee_id,
                'name': staff.user.get_full_name() or staff.user.username,
                'designation': staff.get_designation_display(),
                'shift': staff.get_shift_display(),
                'is_available': staff.is_available,
                'total_assigned': total_assigned,
                'open_count': open_count,
                'resolved_count': resolved_count,
                'avg_turnaround_hours': avg_tat,
                'breached_count': breached_count,
                'sla_compliance_pct': round((resolved_count - breached_count) / resolved_count * 100, 1) if resolved_count > 0 else 100.0
            })

        # Category turnaround breakdown
        cat_stats = []
        for cat_code, cat_label in ServiceTicket.CATEGORY_CHOICES:
            cat_tkts = ServiceTicket.objects.filter(category=cat_code)
            c_count = cat_tkts.count()
            c_res = cat_tkts.filter(status__in=['RESOLVED', 'CLOSED'])
            c_res_count = c_res.count()
            c_avg = round(sum(t.turnaround_hours for t in c_res) / c_res_count, 1) if c_res_count > 0 else 0.0
            cat_stats.append({
                'category': cat_code,
                'label': cat_label,
                'total_tickets': c_count,
                'resolved_count': c_res_count,
                'avg_turnaround_hours': c_avg
            })

        return Response({
            'staff_performance': staff_stats,
            'category_turnaround': cat_stats
        })


class AcademicProjectInfoView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            'project_title': 'Apartment & Resident Management System',
            'tagline': 'A Normalized Relational Database System (SQL) for Community Housing Administration, Temporal Tenancy Tracking, and ACID Transactional Integrity',
            'institution': 'SRM Institute of Science and Technology, Tiruchirappalli',
            'department': 'Department of Artificial Intelligence',
            'degree': 'B.Tech',
            'academic_year': '2024–2028',
            'faculty_guide': {
                'name': 'Dr. S. P. Ramya',
                'designation': 'Faculty Guide'
            },
            'team_members': [
                {'name': 'Surya B', 'register_number': 'RA2411047050042', 'role': 'Database Architecture & Backend Systems'},
                {'name': 'Rohan raj', 'register_number': 'RA2411047050010', 'role': 'Relational Schema & Security Enforcement'},
                {'name': 'Saminathan M', 'register_number': 'RA2411047050055', 'role': 'Full-Stack Workflows & Frontend Integration'}
            ],
            'evaluation_review': {
                'phase': 'Review 1 Deliverable & Complete Implementation',
                'schema_normalization': 'Third Normal Form (3NF Strict)',
                'storage_engine': 'InnoDB / PostgreSQL ACID-Compliant',
                'milestones': [
                    {'title': 'Topic / Problem Identification', 'status': 'COMPLETED', 'details': 'Analyzed 6 operational friction points in apartment communities.'},
                    {'title': 'Requirement Collection', 'status': 'COMPLETED', 'details': 'Documented functional scope, ACID requirements, and stakeholder roles.'},
                    {'title': 'System Design / Workflow', 'status': 'COMPLETED', 'details': 'Designed modular 4-tier workflow (Input -> Logic -> SQL -> Output).'},
                    {'title': 'Relational Schema & ER Design', 'status': 'COMPLETED', 'details': 'Defined 9 core relational tables normalized to 3NF with key constraints.'},
                    {'title': 'Initial DDL Implementation', 'status': 'COMPLETED', 'details': 'Engineered SQL scripts (CREATE TABLE, triggers, check constraints).'},
                    {'title': 'Testing / UI Integration', 'status': 'COMPLETED', 'details': 'Full-stack React portal, REST APIs, and automated transactional test suite.'}
                ]
            },
            'core_entities': [
                'Flats', 'Residents', 'Occupancy_History', 'Maintenance_Invoices',
                'Payments', 'Service_Tickets', 'Visitor_Logs', 'Amenities', 'Parking_Slots'
            ]
        })
