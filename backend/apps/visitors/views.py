from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import VisitorLog
from .serializers import VisitorLogSerializer
from apps.accounts.permissions import IsStaffOrAdminRole
from apps.audit.models import log_event

class VisitorLogViewSet(viewsets.ModelViewSet):
    queryset = VisitorLog.objects.select_related('destination_flat__building', 'resident_host', 'guard_user').all()
    serializer_class = VisitorLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.role == 'RESIDENT' and not user.is_superuser:
            # Resident can only view visitors bound for their flat
            if hasattr(user, 'resident_profile') and user.resident_profile.current_flat:
                qs = qs.filter(destination_flat=user.resident_profile.current_flat)
            else:
                qs = qs.none()

        flat_id = self.request.query_params.get('flat')
        status_val = self.request.query_params.get('status')
        purpose = self.request.query_params.get('purpose')
        search = self.request.query_params.get('search')

        if flat_id:
            qs = qs.filter(destination_flat_id=flat_id)
        if status_val:
            qs = qs.filter(status=status_val)
        if purpose:
            qs = qs.filter(purpose=purpose)
        if search:
            qs = qs.filter(visitor_name__icontains=search) | qs.filter(vehicle_number__icontains=search) | qs.filter(phone_number__icontains=search)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        pass_num = f"VIS-{timezone.now().strftime('%Y%m')}-{VisitorLog.objects.count() + 1001}"
        instance = serializer.save(
            pass_number=pass_num,
            guard_user=user,
            status='CHECKED_IN'
        )
        log_event(
            user, 'GATE_CHECKIN', 'VisitorLog', instance.id,
            f"Gate Entry: {instance.visitor_name} to Flat {instance.destination_flat.full_flat_code} (Pass #{instance.pass_number})"
        )

    @action(detail=True, methods=['post'], permission_classes=[IsStaffOrAdminRole])
    def checkout(self, request, pk=None):
        """Action for gate guard to register visitor exit."""
        visitor = self.get_object()
        visitor.check_out()
        log_event(
            request.user, 'GATE_CHECKOUT', 'VisitorLog', visitor.id,
            f"Gate Exit: {visitor.visitor_name} departs campus (Pass #{visitor.pass_number})"
        )
        serializer = self.get_serializer(visitor)
        return Response(serializer.data)
