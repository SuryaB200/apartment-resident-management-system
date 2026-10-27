from django.contrib import admin
from .models import VisitorLog

@admin.register(VisitorLog)
class VisitorLogAdmin(admin.ModelAdmin):
    list_display = ('pass_number', 'visitor_name', 'phone_number', 'destination_flat', 'resident_host', 'purpose', 'vehicle_number', 'status', 'check_in_time', 'check_out_time')
    list_filter = ('status', 'purpose', 'gate_name')
    search_fields = ('pass_number', 'visitor_name', 'phone_number', 'vehicle_number', 'destination_flat__flat_number')
    date_hierarchy = 'check_in_time'
    ordering = ('-check_in_time',)
