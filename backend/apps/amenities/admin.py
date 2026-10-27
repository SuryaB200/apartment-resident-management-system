from django.contrib import admin
from .models import Amenity, AmenityBooking

@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'location', 'capacity', 'hourly_rate', 'opening_time', 'closing_time', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'code', 'location')

@admin.register(AmenityBooking)
class AmenityBookingAdmin(admin.ModelAdmin):
    list_display = ('booking_reference', 'amenity', 'resident', 'flat', 'booking_date', 'start_time', 'end_time', 'total_charge', 'status')
    list_filter = ('status', 'amenity')
    search_fields = ('booking_reference', 'amenity__name', 'resident__first_name', 'resident__last_name', 'flat__flat_number')
    date_hierarchy = 'booking_date'
    ordering = ('-booking_date', '-start_time')
