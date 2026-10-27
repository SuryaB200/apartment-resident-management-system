from django.contrib import admin
from .models import ServiceTicket

@admin.register(ServiceTicket)
class ServiceTicketAdmin(admin.ModelAdmin):
    list_display = ('ticket_number', 'flat', 'resident', 'category', 'priority', 'status', 'assigned_staff', 'opened_at', 'resolved_at')
    list_filter = ('category', 'priority', 'status', 'flat__building')
    search_fields = ('ticket_number', 'title', 'description', 'flat__flat_number', 'resident__first_name', 'resident__last_name')
    date_hierarchy = 'opened_at'
    ordering = ('-opened_at',)
