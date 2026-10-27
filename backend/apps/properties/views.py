from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Building, Flat
from .serializers import BuildingSerializer, FlatSerializer
from apps.accounts.permissions import IsStaffOrAdminRole
from apps.audit.models import log_event

class BuildingViewSet(viewsets.ModelViewSet):
    queryset = Building.objects.all().order_by('code')
    serializer_class = BuildingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save()
        log_event(self.request.user, 'CREATE', 'Building', instance.id, f"Building {instance.name} created")

    def perform_update(self, serializer):
        instance = serializer.save()
        log_event(self.request.user, 'UPDATE', 'Building', instance.id, f"Building {instance.name} updated")


class FlatViewSet(viewsets.ModelViewSet):
    queryset = Flat.objects.select_related('building', 'current_owner').prefetch_related('occupancy_history__resident').all()
    serializer_class = FlatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        building = self.request.query_params.get('building')
        status = self.request.query_params.get('status')
        floor = self.request.query_params.get('floor')
        bhk = self.request.query_params.get('bhk')
        search = self.request.query_params.get('search')

        if building:
            qs = qs.filter(building_id=building)
        if status:
            qs = qs.filter(occupancy_status=status)
        if floor:
            qs = qs.filter(floor_number=floor)
        if bhk:
            qs = qs.filter(bhk_type=bhk)
        if search:
            qs = qs.filter(flat_number__icontains=search) | qs.filter(building__name__icontains=search) | qs.filter(building__code__icontains=search)
        return qs

    def perform_create(self, serializer):
        instance = serializer.save()
        log_event(self.request.user, 'CREATE', 'Flat', instance.id, f"Flat {instance.full_flat_code} created")

    def perform_update(self, serializer):
        instance = serializer.save()
        log_event(self.request.user, 'UPDATE', 'Flat', instance.id, f"Flat {instance.full_flat_code} updated")
