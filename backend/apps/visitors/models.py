from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError

class VisitorLog(models.Model):
    PURPOSE_CHOICES = [
        ('GUEST', 'Personal Guest / Family'),
        ('DELIVERY', 'Courier / Delivery (Amazon, Swiggy, Zomato)'),
        ('SERVICE', 'Home Service / Maintenance Provider'),
        ('CAB', 'Cab / Taxi Drop & Pickup'),
        ('OFFICIAL', 'Official / Government / Inspection'),
        ('OTHER', 'General Visitor'),
    ]

    STATUS_CHOICES = [
        ('CHECKED_IN', 'Checked In (Active on Campus)'),
        ('CHECKED_OUT', 'Checked Out (Departed)'),
        ('DENIED', 'Entry Denied'),
    ]

    pass_number = models.CharField(max_length=50, unique=True)
    visitor_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    destination_flat = models.ForeignKey(
        'properties.Flat', on_delete=models.PROTECT, related_name='visitor_logs'
    )
    resident_host = models.ForeignKey(
        'residents.Resident', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='hosted_visitors'
    )
    purpose = models.CharField(max_length=30, choices=PURPOSE_CHOICES, default='GUEST')
    vehicle_number = models.CharField(max_length=30, blank=True, null=True)
    check_in_time = models.DateTimeField(default=timezone.now)
    check_out_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='CHECKED_IN')
    gate_name = models.CharField(max_length=50, default='Main Gate 01')
    guard_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='logged_visitors'
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-check_in_time']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['check_in_time']),
            models.Index(fields=['visitor_name']),
            models.Index(fields=['vehicle_number']),
        ]

    def clean(self):
        super().clean()
        if self.check_out_time and self.check_out_time < self.check_in_time:
            raise ValidationError({'check_out_time': 'Check-out time cannot precede check-in time.'})

    def check_out(self):
        """Action for security guard to register departure."""
        self.check_out_time = timezone.now()
        self.status = 'CHECKED_OUT'
        self.save()

    def __str__(self):
        return f"{self.pass_number}: {self.visitor_name} -> Flat {self.destination_flat} ({self.get_status_display()})"
