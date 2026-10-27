from django.db import models

class SystemSetting(models.Model):
    CATEGORY_CHOICES = [
        ('FINANCE', 'Financial & Late Fees Policy'),
        ('PARKING', 'Parking Allocation Quota'),
        ('MAINTENANCE', 'Maintenance SLAs & Escalations'),
        ('SOCIETY', 'Society Administration & Rules'),
    ]

    key = models.CharField(max_length=100, unique=True)
    value = models.CharField(max_length=255)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='SOCIETY')
    description = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'key']

    def __str__(self):
        return f"{self.key} = {self.value}"
