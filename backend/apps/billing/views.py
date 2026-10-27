from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from datetime import datetime, date, timedelta
from decimal import Decimal
import uuid

from .models import LateFeePolicy, MaintenanceInvoice, Payment
from .serializers import LateFeePolicySerializer, MaintenanceInvoiceSerializer, PaymentSerializer
from apps.properties.models import Flat
from apps.accounts.permissions import IsStaffOrAdminRole
from apps.audit.models import log_event

class LateFeePolicyViewSet(viewsets.ModelViewSet):
    queryset = LateFeePolicy.objects.all().order_by('-is_active', '-created_at')
    serializer_class = LateFeePolicySerializer
    permission_classes = [IsStaffOrAdminRole]

    def perform_create(self, serializer):
        instance = serializer.save()
        log_event(self.request.user, 'CREATE', 'LateFeePolicy', instance.id, f"Created policy {instance.name}")

    def perform_update(self, serializer):
        instance = serializer.save()
        log_event(self.request.user, 'UPDATE', 'LateFeePolicy', instance.id, f"Updated policy {instance.name}")


class MaintenanceInvoiceViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceInvoice.objects.select_related('flat__building', 'resident').all()
    serializer_class = MaintenanceInvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.role == 'RESIDENT' and not user.is_superuser:
            qs = qs.filter(resident__user=user)

        flat_id = self.request.query_params.get('flat')
        period = self.request.query_params.get('period')
        status_val = self.request.query_params.get('status')
        overdue_only = self.request.query_params.get('overdue')

        if flat_id:
            qs = qs.filter(flat_id=flat_id)
        if period:
            qs = qs.filter(billing_period=period)
        if status_val:
            qs = qs.filter(status=status_val)
        if overdue_only and overdue_only.lower() in ('true', '1'):
            qs = qs.filter(status='OVERDUE')

        return qs

    def perform_create(self, serializer):
        flat = serializer.validated_data.get('flat')
        period = serializer.validated_data.get('billing_period')
        base = serializer.validated_data.get('base_amount', Decimal('3500.00'))
        invoice_number = serializer.validated_data.get(
            'invoice_number',
            f"INV-{period.replace('-', '')}-{flat.full_flat_code.replace('-', '')}"
        )
        instance = serializer.save(
            invoice_number=invoice_number,
            total_amount=base,
            outstanding_balance=base,
            status='ISSUED'
        )
        log_event(
            self.request.user, 'CREATE', 'MaintenanceInvoice', instance.id,
            f"Created invoice {instance.invoice_number} for {instance.flat.full_flat_code}"
        )

    @action(detail=False, methods=['post'], permission_classes=[IsStaffOrAdminRole])
    def run_billing_cycle(self, request):
        """
        Automated Billing Engine:
        1. Issues monthly maintenance invoices across all active flats for requested period.
        2. Detects overdue invoices past grace period and applies configured LateFeePolicy.
        """
        now = timezone.now()
        billing_period = request.data.get('billing_period', now.strftime('%Y-%m'))
        issue_date_str = request.data.get('issue_date', date(now.year, now.month, 1).isoformat())
        due_date_str = request.data.get('due_date', (date(now.year, now.month, 1) + timedelta(days=15)).isoformat())

        issue_date = datetime.strptime(issue_date_str, '%Y-%m-%d').date() if isinstance(issue_date_str, str) else issue_date_str
        due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date() if isinstance(due_date_str, str) else due_date_str

        policy = LateFeePolicy.objects.filter(is_active=True).first()
        if not policy:
            policy = LateFeePolicy.objects.create(
                name='Default 5% Surcharge Policy',
                policy_type='PERCENTAGE',
                rate_or_amount=Decimal('5.00'),
                grace_period_days=5,
                is_active=True
            )

        generated_count = 0
        overdue_penalized_count = 0

        with transaction.atomic():
            # 1. Invoice generation for all flats
            flats = Flat.objects.select_related('building', 'current_owner').all()
            for flat in flats:
                existing = MaintenanceInvoice.objects.filter(flat=flat, billing_period=billing_period).exists()
                if not existing:
                    # Calculate rate: ₹3.50 per sq. ft carpet area
                    calc_base = (flat.carpet_area_sqft * Decimal('3.50')).quantize(Decimal('0.01'))
                    if calc_base < Decimal('1500.00'):
                        calc_base = Decimal('1500.00')

                    current_occ = flat.occupancy_history.filter(status='CURRENT').first()
                    bill_resident = current_occ.resident if current_occ else flat.current_owner

                    inv_num = f"INV-{billing_period.replace('-', '')}-{flat.full_flat_code.replace('-', '')}"
                    MaintenanceInvoice.objects.create(
                        invoice_number=inv_num,
                        flat=flat,
                        resident=bill_resident,
                        billing_period=billing_period,
                        issue_date=issue_date,
                        due_date=due_date,
                        base_amount=calc_base,
                        late_fee_amount=Decimal('0.00'),
                        total_amount=calc_base,
                        amount_paid=Decimal('0.00'),
                        outstanding_balance=calc_base,
                        status='ISSUED',
                        notes=f"Automated monthly maintenance levy for {billing_period}."
                    )
                    generated_count += 1

            # 2. Overdue & Late Fee Trigger check on unpaid invoices past grace date
            today = timezone.now().date()
            unpaid_invoices = MaintenanceInvoice.objects.filter(
                status__in=['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'],
                outstanding_balance__gt=Decimal('0.00')
            )

            for inv in unpaid_invoices:
                grace_deadline = inv.due_date + timedelta(days=policy.grace_period_days)
                if today > grace_deadline:
                    inv.status = 'OVERDUE'
                    if not inv.late_fee_applied:
                        fine = policy.calculate_fine(inv.base_amount)
                        inv.late_fee_amount = fine
                        inv.late_fee_applied = True
                        inv.recalculate_totals()
                        inv.save()
                        overdue_penalized_count += 1
                    else:
                        inv.save()

            log_event(
                request.user, 'BILLING_TRIGGER_RUN', 'MaintenanceInvoice', 'BATCH',
                f"Generated {generated_count} new invoices for {billing_period}. Applied late fines to {overdue_penalized_count} overdue records."
            )

        return Response({
            'success': True,
            'billing_period': billing_period,
            'generated_count': generated_count,
            'overdue_penalized_count': overdue_penalized_count,
            'policy_applied': policy.name,
            'message': f"Successfully generated {generated_count} invoices and processed overdue triggers."
        })


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('invoice__flat__building', 'resident', 'recorded_by').all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.role == 'RESIDENT' and not user.is_superuser:
            qs = qs.filter(resident__user=user)

        invoice_id = self.request.query_params.get('invoice')
        method = self.request.query_params.get('method')
        search = self.request.query_params.get('search')

        if invoice_id:
            qs = qs.filter(invoice_id=invoice_id)
        if method:
            qs = qs.filter(payment_method=method)
        if search:
            qs = qs.filter(receipt_number__icontains=search) | qs.filter(transaction_reference__icontains=search)

        return qs

    def create(self, request, *args, **kwargs):
        """
        ACID Transactional Payment Recording:
        - Locks invoice row using select_for_update()
        - Validates payment against outstanding balance
        - Atomically updates paid balance and status
        - Logs audit trail
        """
        invoice_id = request.data.get('invoice')
        amount_paid_raw = request.data.get('amount_paid')
        payment_method = request.data.get('payment_method', 'UPI')
        tx_ref = request.data.get('transaction_reference') or f"TXN-{uuid.uuid4().hex[:10].upper()}"
        notes = request.data.get('notes', '')

        if not invoice_id or not amount_paid_raw:
            return Response(
                {'error': 'Both invoice ID and amount_paid are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            amount_paid = Decimal(str(amount_paid_raw)).quantize(Decimal('0.01'))
        except Exception:
            return Response({'error': 'Invalid currency amount provided.'}, status=status.HTTP_400_BAD_REQUEST)

        if amount_paid <= Decimal('0.00'):
            return Response({'error': 'Payment amount must be greater than zero.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            try:
                invoice = MaintenanceInvoice.objects.select_for_update().get(pk=invoice_id)
            except MaintenanceInvoice.DoesNotExist:
                return Response({'error': 'Referenced invoice does not exist.'}, status=status.HTTP_404_NOT_FOUND)

            if amount_paid > invoice.outstanding_balance:
                return Response(
                    {'error': f"Amount ₹{amount_paid} exceeds permitted outstanding balance ₹{invoice.outstanding_balance}."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check for duplicate payment transaction reference
            if Payment.objects.filter(transaction_reference=tx_ref).exists():
                return Response(
                    {'error': f"Transaction reference '{tx_ref}' has already been processed."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            receipt_number = f"REC-{timezone.now().strftime('%Y%m')}-{Payment.objects.count() + 1001}"
            payment_date = request.data.get('payment_date') or timezone.now()

            payment = Payment.objects.create(
                receipt_number=receipt_number,
                invoice=invoice,
                resident=invoice.resident,
                amount_paid=amount_paid,
                payment_date=payment_date,
                payment_method=payment_method,
                transaction_reference=tx_ref,
                recorded_by=request.user,
                notes=notes
            )

            # Update invoice amounts
            invoice.amount_paid += amount_paid
            invoice.outstanding_balance -= amount_paid
            if invoice.outstanding_balance <= Decimal('0.00'):
                invoice.status = 'PAID'
                invoice.outstanding_balance = Decimal('0.00')
            else:
                invoice.status = 'PARTIALLY_PAID'
            invoice.save()

            log_event(
                request.user, 'PAYMENT_RECORDED', 'Payment', payment.id,
                f"Receipt {payment.receipt_number}: Recorded ₹{amount_paid} for {invoice.invoice_number} (Method: {payment_method})"
            )

            serializer = self.get_serializer(payment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
