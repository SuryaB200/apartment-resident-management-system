from django.db import models
from django.conf import settings

class Resident(models.Model):
    RESIDENT_TYPE_CHOICES = [
        ('OWNER', 'Property Owner'),
        ('TENANT', 'Tenant / Lessee'),
    ]
    ID_PROOF_CHOICES = [
        ('AADHAAR', 'Aadhaar Card'),
        ('PASSPORT', 'Passport'),
        ('VOTER_ID', 'Voter Identity Card'),
        ('DRIVING_LICENSE', 'Driving License'),
        ('OTHER', 'Other Official ID'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='resident_profile'
    )
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True)
    resident_type = models.CharField(max_length=20, choices=RESIDENT_TYPE_CHOICES, default='TENANT')
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True, null=True)
    id_proof_type = models.CharField(max_length=30, choices=ID_PROOF_CHOICES, default='AADHAAR')
    id_proof_number = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['first_name', 'last_name']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone']),
            models.Index(fields=['resident_type']),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.get_resident_type_display()})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def current_flat(self):
        active_occ = self.occupancy_records.filter(status='CURRENT').first()
        return active_occ.flat if active_occ else None
