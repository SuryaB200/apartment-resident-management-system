from rest_framework import serializers
from .models import ServiceTicket

class ServiceTicketSerializer(serializers.ModelSerializer):
    flat_code = serializers.CharField(source='flat.full_flat_code', read_only=True)
    building_name = serializers.CharField(source='flat.building.name', read_only=True)
    resident_name = serializers.CharField(source='resident.full_name', read_only=True)
    resident_phone = serializers.CharField(source='resident.phone', read_only=True)
    assigned_staff_name = serializers.CharField(source='assigned_staff.user.get_full_name', read_only=True)
    assigned_staff_designation = serializers.CharField(source='assigned_staff.get_designation_display', read_only=True)
    turnaround_hours = serializers.FloatField(read_only=True)
    sla_limit_hours = serializers.IntegerField(read_only=True)
    is_sla_breached = serializers.BooleanField(read_only=True)

    class Meta:
        model = ServiceTicket
        fields = [
            'id', 'ticket_number', 'flat', 'flat_code', 'building_name',
            'resident', 'resident_name', 'resident_phone', 'category',
            'priority', 'title', 'description', 'status', 'assigned_staff',
            'assigned_staff_name', 'assigned_staff_designation', 'opened_at',
            'assigned_at', 'in_progress_at', 'resolved_at', 'closed_at',
            'resolution_notes', 'feedback_rating', 'turnaround_hours',
            'sla_limit_hours', 'is_sla_breached', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'ticket_number', 'opened_at', 'assigned_at', 'in_progress_at',
            'resolved_at', 'closed_at', 'created_at', 'updated_at'
        ]
