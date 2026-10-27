from django.db import models, transaction
from django.utils import timezone
from django.core.exceptions import ValidationError

class ParkingSlot(models.Model):
    SLOT_TYPE_CHOICES = [
        ('FOUR_WHEELER', 'Four Wheeler (Car)'),
        ('TWO_WHEELER', 'Two Wheeler (Motorcycle)'),
        ('EV_CHARGING', 'EV Charging Bay'),
        ('VISITOR', 'Visitor Temporary Bay'),
    ]
    STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('ALLOCATED', 'Allocated'),
        ('MAINTENANCE', 'Reserved / Maintenance'),
    ]

    slot_number = models.CharField(max_length=30, unique=True)
    location_zone = models.CharField(max_length=100, default='Basement Level 1')
    slot_type = models.CharField(max_length=20, choices=SLOT_TYPE_CHOICES, default='FOUR_WHEELER')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['slot_number']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['slot_type']),
        ]

    def __str__(self):
        return f"{self.slot_number} ({self.location_zone} - {self.get_slot_type_display()})"


class ParkingAllocation(models.Model):
    slot = models.ForeignKey(
        ParkingSlot, on_delete=models.PROTECT, related_name='allocations'
    )
    flat = models.ForeignKey(
        'properties.Flat', on_delete=models.PROTECT, related_name='parking_allocations'
    )
    resident = models.ForeignKey(
        'residents.Resident', on_delete=models.PROTECT, related_name='parking_allocations'
    )
    vehicle_number = models.CharField(max_length=30)
    vehicle_make_model = models.CharField(max_length=100, blank=True, null=True)
    vehicle_type = models.CharField(
        max_length=20, choices=[('CAR', 'Car / 4-Wheeler'), ('BIKE', 'Bike / Scooter'), ('OTHER', 'Other')],
        default='CAR'
    )
    allocated_at = models.DateTimeField(default=timezone.now)
    released_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-allocated_at']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['vehicle_number']),
        ]

    def clean(self):
        super().clean()
        if self.is_active:
            # 1. Check if slot already has another active allocation
            slot_conflict = ParkingAllocation.objects.filter(
                slot=self.slot,
                is_active=True
            ).exclude(pk=self.pk)

            if slot_conflict.exists():
                raise ValidationError({
                    'slot': f"Slot {self.slot.slot_number} is already actively allocated to flat {slot_conflict.first().flat}."
                })

            # 2. Check per-flat quota (configurable via SystemSetting, default 2)
            from apps.reporting.models import SystemSetting
            quota_setting = SystemSetting.objects.filter(key='MAX_PARKING_SLOTS_PER_FLAT').first()
            max_quota = int(quota_setting.value) if quota_setting and quota_setting.value.isdigit() else 2

            current_flat_active = ParkingAllocation.objects.filter(
                flat=self.flat,
                is_active=True
            ).exclude(pk=self.pk).count()

            if current_flat_active >= max_quota:
                raise ValidationError({
                    'flat': f"Flat {self.flat} has already reached its allocated quota limit of {max_quota} parking slots."
                })

    def save(self, *args, **kwargs):
        with transaction.atomic():
            self.full_clean()
            super().save(*args, **kwargs)
            # Synchronize slot status
            slot = self.slot
            if self.is_active:
                slot.status = 'ALLOCATED'
            else:
                slot.status = 'AVAILABLE'
            slot.save(update_fields=['status'])

    def release(self):
        """Releases the slot allocation and frees the bay."""
        self.is_active = False
        self.released_at = timezone.now()
        self.save()

    def __str__(self):
        return f"{self.slot.slot_number} -> Flat {self.flat} ({self.vehicle_number})"
