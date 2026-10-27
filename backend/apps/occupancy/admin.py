from django.contrib import admin
from .models import OccupancyHistory

@admin.register(OccupancyHistory)
class OccupancyHistoryAdmin(admin.ModelAdmin):
    list_display = ('flat', 'resident', 'occupancy_type', 'status', 'move_in_date', 'move_out_date', 'agreement_reference')
    list_filter = ('status', 'occupancy_type', 'flat__building')
    search_fields = ('flat__flat_number', 'resident__first_name', 'resident__last_name', 'agreement_reference')
    date_hierarchy = 'move_in_date'
    ordering = ('-move_in_date',)
