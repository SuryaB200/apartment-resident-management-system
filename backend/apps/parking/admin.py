from django.contrib import admin
from .models import ParkingSlot, ParkingAllocation

@admin.register(ParkingSlot)
class ParkingSlotAdmin(admin.ModelAdmin):
    list_display = ('slot_number', 'location_zone', 'slot_type', 'status')
    list_filter = ('slot_type', 'status', 'location_zone')
    search_fields = ('slot_number', 'location_zone')
    ordering = ('slot_number',)

@admin.register(ParkingAllocation)
class ParkingAllocationAdmin(admin.ModelAdmin):
    list_display = ('slot', 'flat', 'resident', 'vehicle_number', 'vehicle_make_model', 'vehicle_type', 'allocated_at', 'released_at', 'is_active')
    list_filter = ('vehicle_type', 'is_active')
    search_fields = ('slot__slot_number', 'flat__flat_number', 'resident__first_name', 'resident__last_name', 'vehicle_number')
    date_hierarchy = 'allocated_at'
    ordering = ('-allocated_at',)
