from django.db import models, transaction
from django.core.exceptions import ValidationError
from django.db.models import Q
from decimal import Decimal

class Amenity(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=30, unique=True)
    description = models.TextField()
    location = models.CharField(max_length=100, default='Central Clubhouse Complex')
    capacity = models.PositiveIntegerField(default=50)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))
    opening_time = models.TimeField(default='06:00:00')
    closing_time = models.TimeField(default='22:00:00')
    rules = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class AmenityBooking(models.Model):
    STATUS_CHOICES = [
        ('CONFIRMED', 'Confirmed Active'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]

    booking_reference = models.CharField(max_length=50, unique=True)
    amenity = models.ForeignKey(
        Amenity, on_delete=models.PROTECT, related_name='bookings'
    )
    resident = models.ForeignKey(
        'residents.Resident', on_delete=models.PROTECT, related_name='amenity_bookings'
    )
    flat = models.ForeignKey(
        'properties.Flat', on_delete=models.PROTECT, related_name='amenity_bookings'
    )
    booking_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    attendees_count = models.PositiveIntegerField(default=1)
    total_charge = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='CONFIRMED')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-booking_date', '-start_time']
        indexes = [
            models.Index(fields=['amenity', 'booking_date', 'status']),
            models.Index(fields=['booking_date']),
        ]

    def clean(self):
        super().clean()
        if self.start_time >= self.end_time:
            raise ValidationError({'end_time': 'End time must be later than start time.'})

        if self.amenity and self.attendees_count > self.amenity.capacity:
            raise ValidationError({
                'attendees_count': f"Requested attendees ({self.attendees_count}) exceeds facility maximum capacity ({self.amenity.capacity})."
            })

        # Overlap conflict verification
        if self.status == 'CONFIRMED' and self.amenity_id and self.booking_date:
            overlapping_query = AmenityBooking.objects.filter(
                amenity=self.amenity,
                booking_date=self.booking_date,
                status='CONFIRMED'
            ).exclude(pk=self.pk)

            # Two intervals [S1, E1) and [S2, E2) overlap if NOT (E1 <= S2 OR S1 >= E2)
            conflicts = overlapping_query.filter(
                start_time__lt=self.end_time,
                end_time__gt=self.start_time
            )

            if conflicts.exists():
                conflict_item = conflicts.first()
                raise ValidationError({
                    'start_time': f"Conflict detected! {self.amenity.name} is already booked from {conflict_item.start_time.strftime('%H:%M')} to {conflict_item.end_time.strftime('%H:%M')} on {self.booking_date} (Ref: {conflict_item.booking_reference})."
                })

    def save(self, *args, **kwargs):
        # Enforce transactional concurrency check
        with transaction.atomic():
            # Lock the amenity record to serialize concurrent bookings for this facility
            Amenity.objects.select_for_update().get(pk=self.amenity_id)
            self.clean()
            super().save(*args, **kwargs)

    def cancel(self):
        self.status = 'CANCELLED'
        self.save(update_fields=['status', 'updated_at'])

    def __str__(self):
        return f"{self.booking_reference}: {self.amenity.name} on {self.booking_date} ({self.start_time}-{self.end_time})"
