from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from decimal import Decimal

class LateFeePolicy(models.Model):
    POLICY_TYPE_CHOICES = [
        ('PERCENTAGE', 'Percentage of Base Amount (%)'),
        ('FIXED', 'Fixed Lump Sum Fine (₹)'),
    ]
    name = models.CharField(max_length=100, default='Standard Late Fee Rule')
    policy_type = models.CharField(max_length=20, choices=POLICY_TYPE_CHOICES, default='PERCENTAGE')
    rate_or_amount = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal('5.00'),
        help_text='Either percentage (e.g. 5.00 for 5%) or flat currency amount'
    )
    grace_period_days = models.PositiveIntegerField(
        default=5, help_text='Number of days after due date before fine applies'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_fine(self, base_amount):
        """Calculates fine using configured policy with Decimal precision."""
        if self.policy_type == 'PERCENTAGE':
            fine = (base_amount * self.rate_or_amount) / Decimal('100.00')
            return fine.quantize(Decimal('0.01'))
        return self.rate_or_amount.quantize(Decimal('0.01'))

    def __str__(self):
        desc = f"{self.rate_or_amount}%" if self.policy_type == 'PERCENTAGE' else f"₹{self.rate_or_amount}"
        return f"{self.name} ({desc}, Grace: {self.grace_period_days} days)"


class MaintenanceInvoice(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('ISSUED', 'Issued'),
        ('PARTIALLY_PAID', 'Partially Paid'),
        ('PAID', 'Paid in Full'),
        ('OVERDUE', 'Overdue'),
    ]

    invoice_number = models.CharField(max_length=50, unique=True)
    flat = models.ForeignKey(
        'properties.Flat', on_delete=models.PROTECT, related_name='invoices'
    )
    resident = models.ForeignKey(
        'residents.Resident', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='invoices'
    )
    billing_period = models.CharField(
        max_length=7, help_text='Format: YYYY-MM (e.g. 2024-10)'
    )
    issue_date = models.DateField()
    due_date = models.DateField()
    base_amount = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))]
    )
    late_fee_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    total_amount = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))]
    )
    amount_paid = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    outstanding_balance = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))]
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ISSUED')
    late_fee_applied = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('flat', 'billing_period')
        ordering = ['-billing_period', 'flat__flat_number']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['billing_period']),
            models.Index(fields=['due_date']),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(outstanding_balance__gte=Decimal('0.00')),
                name='non_negative_balance'
            ),
            models.CheckConstraint(
                condition=models.Q(amount_paid__gte=Decimal('0.00')),
                name='non_negative_paid'
            ),
        ]

    def recalculate_totals(self):
        """Deterministically recalculates total and outstanding balance."""
        self.total_amount = (self.base_amount + self.late_fee_amount).quantize(Decimal('0.01'))
        self.outstanding_balance = (self.total_amount - self.amount_paid).quantize(Decimal('0.01'))
        if self.outstanding_balance <= Decimal('0.00'):
            self.status = 'PAID'
            self.outstanding_balance = Decimal('0.00')
        elif self.amount_paid > Decimal('0.00'):
            self.status = 'PARTIALLY_PAID'
        # Do not override OVERDUE if no payments made

    def clean(self):
        super().clean()
        if self.due_date < self.issue_date:
            raise ValidationError({'due_date': 'Due date cannot precede issue date.'})
        if self.amount_paid > self.total_amount:
            raise ValidationError({'amount_paid': 'Amount paid cannot exceed total invoice amount.'})

    def save(self, *args, **kwargs):
        self.recalculate_totals()
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.invoice_number} - Flat {self.flat} ({self.billing_period}): ₹{self.total_amount} [{self.get_status_display()}]"


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('UPI', 'UPI / QR Scan'),
        ('NEFT_RTGS', 'Bank Transfer (NEFT/RTGS)'),
        ('CHEQUE', 'Cheque Deposit'),
        ('CASH', 'Cash Counter'),
        ('CREDIT_CARD', 'Credit / Debit Card'),
    ]

    receipt_number = models.CharField(max_length=50, unique=True)
    invoice = models.ForeignKey(
        MaintenanceInvoice, on_delete=models.PROTECT, related_name='payments'
    )
    resident = models.ForeignKey(
        'residents.Resident', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='payments'
    )
    amount_paid = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    payment_date = models.DateTimeField()
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='UPI')
    transaction_reference = models.CharField(max_length=100, help_text='UTR, Transaction ID or Cheque No.')
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='recorded_payments'
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-payment_date', '-created_at']
        indexes = [
            models.Index(fields=['transaction_reference']),
            models.Index(fields=['payment_date']),
        ]

    def __str__(self):
        return f"{self.receipt_number} - ₹{self.amount_paid} for {self.invoice.invoice_number}"
