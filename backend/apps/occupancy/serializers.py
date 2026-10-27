from rest_framework import serializers
from .models import OccupancyHistory

class OccupancyHistorySerializer(serializers.ModelSerializer):
    flat_code = serializers.CharField(source='flat.full_flat_code', read_only=True)
    building_name = serializers.CharField(source='flat.building.name', read_only=True)
    resident_name = serializers.CharField(source='resident.full_name', read_only=True)
    resident_phone = serializers.CharField(source='resident.phone', read_only=True)
    resident_email = serializers.CharField(source='resident.email', read_only=True)

    class Meta:
        model = OccupancyHistory
        fields = [
            'id', 'flat', 'flat_code', 'building_name', 'resident',
            'resident_name', 'resident_phone', 'resident_email',
            'occupancy_type', 'move_in_date', 'move_out_date', 'status',
            'agreement_reference', 'rent_amount', 'deposit_amount',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        move_in = data.get('move_in_date', getattr(self.instance, 'move_in_date', None))
        move_out = data.get('move_out_date', getattr(self.instance, 'move_out_date', None))
        if move_out and move_in and move_out < move_in:
            raise serializers.ValidationError({
                'move_out_date': 'Move-out date cannot be earlier than move-in date.'
            })
        return data
