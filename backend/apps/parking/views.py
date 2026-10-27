from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ParkingSlot, ParkingAllocation
from .serializers import ParkingSlotSerializer, ParkingAllocationSerializer
from apps.accounts.permissions import IsStaffOrAdminRole
from apps.audit.models import log_event

class ParkingSlotViewSet(viewsets.ModelViewSet):
    queryset = ParkingSlot.objects.prefetch_related('allocations__flat__building', 'allocations__resident').all()
    serializer_class = ParkingSlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        status_val = self.request.query_params.get('status')
        slot_type = self.request.query_params.get('type')
        zone = self.request.query_params.get('zone')
        search = self.request.query_params.get('search')

        if status_val:
            qs = qs.filter(status=status_val)
        if slot_type:
            qs = qs.filter(slot_type=slot_type)
        if zone:
            qs = qs.filter(location_zone__icontains=zone)
        if search:
            qs = qs.filter(slot_number__icontains=search)

        return qs

    def perform_create(self, serializer):
        instance = serializer.save()
        log_event(self.request.user, 'CREATE', 'ParkingSlot', instance.id, f"Added bay {instance.slot_number}")


class ParkingAllocationViewSet(viewsets.ModelViewSet):
    queryset = ParkingAllocation.objects.select_related('slot', 'flat__building', 'resident').all()
    serializer_class = ParkingAllocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.role == 'RESIDENT' and not user.is_superuser:
            qs = qs.filter(resident__user=user)

        flat_id = self.request.query_params.get('flat')
        active_only = self.request.query_params.get('active')
        search = self.request.query_params.get('search')

        if flat_id:
            qs = qs.filter(flat_id=flat_id)
        if active_only is not None:
            is_act = active_only.lower() in ('true', '1')
            qs = qs.filter(is_active=is_act)
        if search:
            qs = qs.filter(vehicle_number__icontains=search) | qs.filter(slot__slot_number__icontains=search)

        return qs

    def perform_create(self, serializer):
        instance = serializer.save()
        log_event(
            self.request.user, 'PARKING_ALLOCATED', 'ParkingAllocation', instance.id,
            f"Allocated slot {instance.slot.slot_number} to Flat {instance.flat.full_flat_code} for {instance.vehicle_number}"
        )

    @action(detail=True, methods=['post'], permission_classes=[IsStaffOrAdminRole])
    def release(self, request, pk=None):
        """Action to release assigned bay and free slot."""
        allocation = self.get_object()
        allocation.release()
        log_event(
            request.user, 'PARKING_RELEASED', 'ParkingAllocation', allocation.id,
            f"Released parking slot {allocation.slot.slot_number} previously for Flat {allocation.flat.full_flat_code}"
        )
        serializer = self.get_serializer(allocation)
        return Response(serializer.data)
