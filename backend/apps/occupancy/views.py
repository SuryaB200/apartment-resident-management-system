from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import OccupancyHistory
from .serializers import OccupancyHistorySerializer
from apps.accounts.permissions import IsStaffOrAdminRole
from apps.audit.models import log_event

class OccupancyHistoryViewSet(viewsets.ModelViewSet):
    queryset = OccupancyHistory.objects.select_related('flat__building', 'resident').all()
    serializer_class = OccupancyHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.role == 'RESIDENT' and not user.is_superuser:
            qs = qs.filter(resident__user=user)

        flat_id = self.request.query_params.get('flat')
        resident_id = self.request.query_params.get('resident')
        status_val = self.request.query_params.get('status')
        occ_type = self.request.query_params.get('type')

        if flat_id:
            qs = qs.filter(flat_id=flat_id)
        if resident_id:
            qs = qs.filter(resident_id=resident_id)
        if status_val:
            qs = qs.filter(status=status_val)
        if occ_type:
            qs = qs.filter(occupancy_type=occ_type)

        return qs

    def perform_create(self, serializer):
        instance = serializer.save()
        log_event(
            self.request.user, 'CREATE', 'OccupancyHistory', instance.id,
            f"Assigned {instance.resident.full_name} to Flat {instance.flat.full_flat_code} ({instance.status})"
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        log_event(
            self.request.user, 'UPDATE', 'OccupancyHistory', instance.id,
            f"Updated occupancy for Flat {instance.flat.full_flat_code} - {instance.resident.full_name}"
        )

    @action(detail=True, methods=['post'], permission_classes=[IsStaffOrAdminRole])
    def terminate(self, request, pk=None):
        """Action to cleanly record move-out date and release the flat."""
        occupancy = self.get_object()
        move_out_date = request.data.get('move_out_date', timezone.now().date().isoformat())
        notes = request.data.get('notes', 'Tenancy concluded.')

        occupancy.move_out_date = move_out_date
        occupancy.status = 'HISTORICAL'
        if notes:
            occupancy.notes = f"{occupancy.notes or ''}\n[Terminated: {notes}]".strip()
        occupancy.save()

        log_event(
            request.user, 'UPDATE', 'OccupancyHistory', occupancy.id,
            f"Concluded occupancy for {occupancy.resident.full_name} from Flat {occupancy.flat.full_flat_code}"
        )

        serializer = self.get_serializer(occupancy)
        return Response(serializer.data)
