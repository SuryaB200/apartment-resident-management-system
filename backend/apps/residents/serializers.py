from rest_framework import serializers
from .models import Resident

class ResidentSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    current_flat_code = serializers.SerializerMethodField()
    current_flat_id = serializers.SerializerMethodField()
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Resident
        fields = [
            'id', 'user', 'user_username', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'resident_type', 'emergency_contact_name',
            'emergency_contact_phone', 'id_proof_type', 'id_proof_number',
            'is_active', 'current_flat_id', 'current_flat_code',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'full_name', 'created_at', 'updated_at']

    def get_current_flat_code(self, obj):
        active_occ = obj.occupancy_records.filter(status='CURRENT').first()
        return active_occ.flat.full_flat_code if active_occ else None

    def get_current_flat_id(self, obj):
        active_occ = obj.occupancy_records.filter(status='CURRENT').first()
        return active_occ.flat.id if active_occ else None
