from rest_framework import serializers
from .models import ParkingSlot, ParkingAllocation

class ParkingAllocationSerializer(serializers.ModelSerializer):
    slot_number = serializers.CharField(source='slot.slot_number', read_only=True)
    flat_code = serializers.CharField(source='flat.full_flat_code', read_only=True)
    resident_name = serializers.CharField(source='resident.full_name', read_only=True)

    class Meta:
        model = ParkingAllocation
        fields = [
            'id', 'slot', 'slot_number', 'flat', 'flat_code',
            'resident', 'resident_name', 'vehicle_number',
            'vehicle_make_model', 'vehicle_type', 'allocated_at',
            'released_at', 'is_active', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'allocated_at', 'created_at', 'updated_at']


class ParkingSlotSerializer(serializers.ModelSerializer):
    current_allocation = serializers.SerializerMethodField()

    class Meta:
        model = ParkingSlot
        fields = [
            'id', 'slot_number', 'location_zone', 'slot_type',
            'status', 'current_allocation', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_current_allocation(self, obj):
        active = obj.allocations.filter(is_active=True).first()
        if active:
            return {
                'id': active.id,
                'flat_id': active.flat.id,
                'flat_code': active.flat.full_flat_code,
                'resident_name': active.resident.full_name,
                'vehicle_number': active.vehicle_number,
                'vehicle_type': active.vehicle_type,
                'allocated_at': active.allocated_at,
            }
        return None
