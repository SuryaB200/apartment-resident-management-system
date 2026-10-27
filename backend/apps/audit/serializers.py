from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='acting_user.username', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'acting_user', 'user_username', 'action', 'action_display',
            'entity_type', 'record_id', 'details', 'ip_address', 'timestamp'
        ]
        read_only_fields = ['id', 'acting_user', 'action', 'entity_type', 'record_id', 'details', 'ip_address', 'timestamp']
