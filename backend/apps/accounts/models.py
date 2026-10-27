from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        ('ADMIN', 'Society Administrator'),
        ('RESIDENT', 'Resident / Flat Owner'),
        ('STAFF', 'Facility Staff / Security'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='RESIDENT')
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_admin_role(self):
        return self.role == 'ADMIN' or self.is_superuser

    def is_staff_role(self):
        return self.role in ('ADMIN', 'STAFF') or self.is_staff

    def is_resident_role(self):
        return self.role == 'RESIDENT'

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class StaffProfile(models.Model):
    DESIGNATION_CHOICES = [
        ('SECURITY_GUARD', 'Security Gate Officer'),
        ('PLUMBER', 'Plumbing Technician'),
        ('ELECTRICIAN', 'Electrical Technician'),
        ('ESTATE_MANAGER', 'Estate Operations Manager'),
        ('TECHNICIAN', 'General Facility Technician'),
    ]
    SHIFT_CHOICES = [
        ('MORNING', 'Morning (06:00 - 14:00)'),
        ('EVENING', 'Evening (14:00 - 22:00)'),
        ('NIGHT', 'Night (22:00 - 06:00)'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    employee_id = models.CharField(max_length=30, unique=True)
    designation = models.CharField(max_length=30, choices=DESIGNATION_CHOICES, default='TECHNICIAN')
    shift = models.CharField(max_length=20, choices=SHIFT_CHOICES, default='MORNING')
    phone = models.CharField(max_length=20)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['employee_id']

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.get_designation_display()} ({self.employee_id})"
