from django.db import models
from django.core.validators import MinValueValidator

class Building(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    total_floors = models.PositiveIntegerField(default=10)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['code']

    def __str__(self):
        return f"{self.name} ({self.code})"

    @property
    def total_flats_count(self):
        return self.flats.count()

    @property
    def occupied_flats_count(self):
        return self.flats.filter(occupancy_status='OCCUPIED').count()


class Flat(models.Model):
    OCCUPANCY_STATUS_CHOICES = [
        ('VACANT', 'Vacant'),
        ('OCCUPIED', 'Occupied'),
        ('MAINTENANCE', 'Under Maintenance'),
    ]
    BHK_CHOICES = [
        ('1BHK', '1 BHK Studio'),
        ('2BHK', '2 BHK Premium'),
        ('3BHK', '3 BHK Deluxe'),
        ('4BHK', '4 BHK Luxury'),
        ('PENTHOUSE', 'Penthouse Suite'),
    ]

    building = models.ForeignKey(Building, on_delete=models.PROTECT, related_name='flats')
    flat_number = models.CharField(max_length=20)
    floor_number = models.PositiveIntegerField(default=1)
    bhk_type = models.CharField(max_length=20, choices=BHK_CHOICES, default='2BHK')
    carpet_area_sqft = models.DecimalField(
        max_digits=8, decimal_places=2,
        validators=[MinValueValidator(100.0)]
    )
    occupancy_status = models.CharField(
        max_length=20, choices=OCCUPANCY_STATUS_CHOICES, default='VACANT'
    )
    current_owner = models.ForeignKey(
        'residents.Resident', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='owned_flats'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('building', 'flat_number')
        ordering = ['building__code', 'flat_number']
        indexes = [
            models.Index(fields=['occupancy_status']),
            models.Index(fields=['flat_number']),
        ]

    def __str__(self):
        return f"{self.building.code}-{self.flat_number}"

    @property
    def full_flat_code(self):
        return f"{self.building.code}-{self.flat_number}"
