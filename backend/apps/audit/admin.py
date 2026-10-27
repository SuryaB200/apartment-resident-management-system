from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'acting_user', 'action', 'entity_type', 'record_id', 'ip_address')
    list_filter = ('action', 'entity_type')
    search_fields = ('record_id', 'details', 'acting_user__username', 'ip_address')
    date_hierarchy = 'timestamp'
    ordering = ('-timestamp',)
