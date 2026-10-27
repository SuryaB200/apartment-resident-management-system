from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Record Created'),
        ('UPDATE', 'Record Updated'),
        ('DELETE', 'Record Deleted'),
        ('PAYMENT_RECORDED', 'Payment Logged'),
        ('TICKET_TRANSITION', 'Ticket Status Transition'),
        ('GATE_CHECKIN', 'Visitor Checked In'),
        ('GATE_CHECKOUT', 'Visitor Checked Out'),
        ('BOOKING_CREATED', 'Amenity Slot Booked'),
        ('BOOKING_CANCELLED', 'Amenity Booking Cancelled'),
        ('PARKING_ALLOCATED', 'Parking Bay Allocated'),
        ('PARKING_RELEASED', 'Parking Bay Released'),
        ('BILLING_TRIGGER_RUN', 'Monthly Invoices & Late Fees Triggered'),
        ('SETTING_CHANGED', 'System Policy Changed'),
    ]

    acting_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='audit_actions'
    )
    action = models.CharField(max_length=40, choices=ACTION_CHOICES)
    entity_type = models.CharField(max_length=50)
    record_id = models.CharField(max_length=100)
    details = models.TextField(blank=True, null=True)
    ip_address = models.CharField(max_length=50, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['entity_type', 'record_id']),
            models.Index(fields=['action']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        user_name = self.acting_user.username if self.acting_user else 'System/Automated'
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {user_name} - {self.action} on {self.entity_type} #{self.record_id}"

def log_event(user, action, entity_type, record_id, details=None, ip_address=None):
    """Helper utility to capture auditable system actions without breaking caller transaction."""
    try:
        return AuditLog.objects.create(
            acting_user=user if (user and user.is_authenticated) else None,
            action=action,
            entity_type=entity_type,
            record_id=str(record_id),
            details=str(details) if details else '',
            ip_address=ip_address or '127.0.0.1'
        )
    except Exception as e:
        # Prevent audit logging failure from breaking core business logic
        print(f"Warning: Audit log failure: {e}")
        return None
