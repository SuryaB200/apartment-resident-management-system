from rest_framework import serializers
from .models import VisitorLog

class VisitorLogSerializer(serializers.ModelSerializer):
    destination_flat_code = serializers.CharField(source='destination_flat.full_flat_code', read_only=True)
    building_name = serializers.CharField(source='destination_flat.building.name', read_only=True)
    resident_host_name = serializers.CharField(source='resident_host.full_name', read_only=True)
    guard_name = serializers.CharField(source='guard_user.get_full_name', read_only=True)

    class Meta:
        model = VisitorLog
        fields = [
            'id', 'pass_number', 'visitor_name', 'phone_number',
            'destination_flat', 'destination_flat_code', 'building_name',
            'resident_host', 'resident_host_name', 'purpose',
            'vehicle_number', 'check_in_time', 'check_out_time',
            'status', 'gate_name', 'guard_user', 'guard_name',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'pass_number', 'created_at', 'updated_at']
