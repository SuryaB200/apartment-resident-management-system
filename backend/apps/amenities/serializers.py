from rest_framework import serializers
from .models import Amenity, AmenityBooking

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = [
            'id', 'name', 'code', 'description', 'location',
            'capacity', 'hourly_rate', 'opening_time', 'closing_time',
            'rules', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AmenityBookingSerializer(serializers.ModelSerializer):
    amenity_name = serializers.CharField(source='amenity.name', read_only=True)
    amenity_code = serializers.CharField(source='amenity.code', read_only=True)
    resident_name = serializers.CharField(source='resident.full_name', read_only=True)
    resident_phone = serializers.CharField(source='resident.phone', read_only=True)
    flat_code = serializers.CharField(source='flat.full_flat_code', read_only=True)

    class Meta:
        model = AmenityBooking
        fields = [
            'id', 'booking_reference', 'amenity', 'amenity_name', 'amenity_code',
            'resident', 'resident_name', 'resident_phone', 'flat', 'flat_code',
            'booking_date', 'start_time', 'end_time', 'attendees_count',
            'total_charge', 'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'booking_reference', 'created_at', 'updated_at']
