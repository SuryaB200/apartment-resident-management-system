from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import Q, F

class OccupancyHistory(models.Model):
    STATUS_CHOICES = [
        ('CURRENT', 'Current Occupant'),
        ('HISTORICAL', 'Past Tenancy'),
        ('TERMINATED', 'Prematurely Terminated'),
    ]
    OCCUPANCY_TYPE_CHOICES = [
        ('OWNER', 'Owner Occupant'),
        ('TENANT', 'Tenant / Lessee'),
    ]

    flat = models.ForeignKey(
        'properties.Flat', on_delete=models.PROTECT, related_name='occupancy_history'
    )
    resident = models.ForeignKey(
        'residents.Resident', on_delete=models.PROTECT, related_name='occupancy_records'
    )
    occupancy_type = models.CharField(max_length=20, choices=OCCUPANCY_TYPE_CHOICES, default='TENANT')
    move_in_date = models.DateField()
    move_out_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='CURRENT')
    agreement_reference = models.CharField(max_length=100, blank=True, null=True)
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-move_in_date', '-created_at']
        indexes = [
            models.Index(fields=['flat', 'status']),
            models.Index(fields=['resident', 'status']),
            models.Index(fields=['move_in_date']),
            models.Index(fields=['move_out_date']),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(move_out_date__isnull=True) | Q(move_out_date__gte=F('move_in_date')),
                name='valid_occupancy_date_range'
            )
        ]

    def clean(self):
        super().clean()
        if self.move_out_date and self.move_out_date < self.move_in_date:
            raise ValidationError({'move_out_date': 'Move-out date cannot be earlier than move-in date.'})

        if self.status == 'CURRENT':
            # Check for conflicting CURRENT occupancy by other residents for this flat
            conflicts = OccupancyHistory.objects.filter(
                flat=self.flat,
                status='CURRENT'
            ).exclude(pk=self.pk)

            # If there is another active occupant, prevent duplicate unless explicit termination
            if conflicts.filter(occupancy_type='TENANT').exists() and self.occupancy_type == 'TENANT':
                raise ValidationError({
                    'status': f'Flat {self.flat} already has an active CURRENT tenant. Please terminate the prior tenancy before assigning a new current tenant.'
                })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
        # Synchronize flat occupancy status
        flat = self.flat
        if self.status == 'CURRENT':
            flat.occupancy_status = 'OCCUPIED'
            flat.save(update_fields=['occupancy_status'])
        else:
            has_other_current = OccupancyHistory.objects.filter(flat=flat, status='CURRENT').exclude(pk=self.pk).exists()
            if not has_other_current and flat.occupancy_status == 'OCCUPIED':
                flat.occupancy_status = 'VACANT'
                flat.save(update_fields=['occupancy_status'])

    def __str__(self):
        return f"{self.flat} - {self.resident.full_name} ({self.get_occupancy_type_display()}: {self.move_in_date} to {self.move_out_date or 'Present'})"
