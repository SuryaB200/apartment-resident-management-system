from rest_framework import serializers
from .models import Building, Flat

class BuildingSerializer(serializers.ModelSerializer):
    total_flats_count = serializers.IntegerField(read_only=True)
    occupied_flats_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Building
        fields = [
            'id', 'name', 'code', 'total_floors', 'description',
            'total_flats_count', 'occupied_flats_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FlatSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source='building.name', read_only=True)
    building_code = serializers.CharField(source='building.code', read_only=True)
    current_owner_name = serializers.CharField(source='current_owner.full_name', read_only=True)
    full_flat_code = serializers.CharField(read_only=True)
    active_occupant = serializers.SerializerMethodField()

    class Meta:
        model = Flat
        fields = [
            'id', 'building', 'building_code', 'building_name', 'flat_number',
            'full_flat_code', 'floor_number', 'bhk_type', 'carpet_area_sqft',
            'occupancy_status', 'current_owner', 'current_owner_name',
            'active_occupant', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'full_flat_code', 'created_at', 'updated_at']

    def get_active_occupant(self, obj):
        active_occ = obj.occupancy_history.filter(status='CURRENT').first()
        if active_occ:
            return {
                'id': active_occ.resident.id,
                'name': active_occ.resident.full_name,
                'phone': active_occ.resident.phone,
                'email': active_occ.resident.email,
                'type': active_occ.occupancy_type,
                'move_in_date': active_occ.move_in_date,
            }
        return None
