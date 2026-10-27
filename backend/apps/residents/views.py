from rest_framework import viewsets, permissions, filters
from .models import Resident
from .serializers import ResidentSerializer
from apps.accounts.permissions import IsStaffOrAdminRole
from apps.audit.models import log_event

class ResidentViewSet(viewsets.ModelViewSet):
    queryset = Resident.objects.select_related('user').prefetch_related('occupancy_records__flat__building').all()
    serializer_class = ResidentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        # Resident privacy isolation: If user is a Resident role, only return their own record!
        if user.role == 'RESIDENT' and not user.is_superuser:
            qs = qs.filter(user=user)

        res_type = self.request.query_params.get('type')
        active = self.request.query_params.get('active')
        search = self.request.query_params.get('search')

        if res_type:
            qs = qs.filter(resident_type=res_type)
        if active is not None:
            is_act = active.lower() in ('true', '1')
            qs = qs.filter(is_active=is_act)
        if search:
            qs = qs.filter(first_name__icontains=search) | qs.filter(last_name__icontains=search) | qs.filter(email__icontains=search) | qs.filter(phone__icontains=search)
        return qs

    def perform_create(self, serializer):
        instance = serializer.save()
        log_event(self.request.user, 'CREATE', 'Resident', instance.id, f"Resident {instance.full_name} registered")

    def perform_update(self, serializer):
        instance = serializer.save()
        log_event(self.request.user, 'UPDATE', 'Resident', instance.id, f"Resident {instance.full_name} updated")
