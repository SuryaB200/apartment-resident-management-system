from django.contrib import admin
from .models import Resident

@admin.register(Resident)
class ResidentAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'resident_type', 'phone', 'email', 'id_proof_type', 'is_active')
    list_filter = ('resident_type', 'id_proof_type', 'is_active')
    search_fields = ('first_name', 'last_name', 'email', 'phone', 'id_proof_number')
    ordering = ('first_name', 'last_name')
