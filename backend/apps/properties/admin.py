from django.contrib import admin
from .models import Building, Flat

@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'total_floors', 'total_flats_count', 'occupied_flats_count')
    search_fields = ('name', 'code')
    ordering = ('code',)

@admin.register(Flat)
class FlatAdmin(admin.ModelAdmin):
    list_display = ('flat_number', 'building', 'floor_number', 'bhk_type', 'carpet_area_sqft', 'occupancy_status', 'current_owner')
    list_filter = ('building', 'bhk_type', 'occupancy_status', 'floor_number')
    search_fields = ('flat_number', 'building__name', 'building__code')
    ordering = ('building', 'flat_number')
