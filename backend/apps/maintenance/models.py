from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError

class ServiceTicket(models.Model):
    CATEGORY_CHOICES = [
        ('PLUMBING', 'Plumbing & Drainage'),
        ('ELECTRICAL', 'Electrical & Wiring'),
        ('CARPENTRY', 'Carpentry & Fixtures'),
        ('HVAC', 'HVAC & Air Conditioning'),
        ('CIVIL', 'Civil, Masonry & Seepage'),
        ('HOUSEKEEPING', 'Housekeeping & Garbage'),
        ('SECURITY', 'Gate Security & Intercom'),
        ('OTHER', 'General Maintenance'),
    ]

    PRIORITY_CHOICES = [
        ('LOW', 'Low (48h Standard)'),
        ('MEDIUM', 'Medium (24h Standard)'),
        ('HIGH', 'High (8h Expedited)'),
        ('EMERGENCY', 'Emergency (2h Critical)'),
    ]

    STATUS_CHOICES = [
        ('OPEN', 'Open (New)'),
        ('ASSIGNED', 'Assigned to Staff'),
        ('IN_PROGRESS', 'In Progress / Work Underway'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed & Verified'),
    ]

    ticket_number = models.CharField(max_length=50, unique=True)
    flat = models.ForeignKey(
        'properties.Flat', on_delete=models.CASCADE, related_name='service_tickets'
    )
    resident = models.ForeignKey(
        'residents.Resident', on_delete=models.CASCADE, related_name='service_tickets'
    )
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='PLUMBING')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='MEDIUM')
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    assigned_staff = models.ForeignKey(
        'accounts.StaffProfile', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_tickets'
    )
    opened_at = models.DateTimeField(auto_now_add=True)
    assigned_at = models.DateTimeField(null=True, blank=True)
    in_progress_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True, null=True)
    feedback_rating = models.PositiveSmallIntegerField(
        null=True, blank=True, choices=[(1,'1'),(2,'2'),(3,'3'),(4,'4'),(5,'5')]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-opened_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['priority']),
            models.Index(fields=['category']),
            models.Index(fields=['opened_at']),
        ]

    SLA_HOURS_MAP = {
        'EMERGENCY': 2,
        'HIGH': 8,
        'MEDIUM': 24,
        'LOW': 48,
    }

    @property
    def sla_limit_hours(self):
        return self.SLA_HOURS_MAP.get(self.priority, 24)

    @property
    def turnaround_hours(self):
        end_time = self.resolved_at or timezone.now()
        delta = end_time - self.opened_at
        return round(delta.total_seconds() / 3600.0, 1)

    @property
    def is_sla_breached(self):
        return self.turnaround_hours > self.sla_limit_hours

    def transition_to(self, target_status, user=None, notes=None, staff=None):
        """Validates and applies the state machine transition."""
        allowed_transitions = {
            'OPEN': ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED'],
            'ASSIGNED': ['IN_PROGRESS', 'RESOLVED', 'OPEN'],
            'IN_PROGRESS': ['RESOLVED', 'ASSIGNED'],
            'RESOLVED': ['CLOSED', 'IN_PROGRESS'],
            'CLOSED': ['OPEN'], # Re-open by admin
        }

        if target_status not in allowed_transitions.get(self.status, []):
            raise ValidationError(f"Invalid transition from {self.status} to {target_status}.")

        now = timezone.now()
        if target_status == 'ASSIGNED':
            if staff:
                self.assigned_staff = staff
            if not self.assigned_at:
                self.assigned_at = now
        elif target_status == 'IN_PROGRESS':
            if not self.in_progress_at:
                self.in_progress_at = now
        elif target_status == 'RESOLVED':
            self.resolved_at = now
            if notes:
                self.resolution_notes = notes
        elif target_status == 'CLOSED':
            self.closed_at = now

        self.status = target_status
        self.save()

    def __str__(self):
        return f"{self.ticket_number}: {self.title} ({self.get_status_display()})"
