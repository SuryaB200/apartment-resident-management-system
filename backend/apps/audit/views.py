from rest_framework import viewsets, permissions
from .models import AuditLog
from .serializers import AuditLogSerializer
from apps.accounts.permissions import IsAdminRole

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Immutable audit trail logview. Restricted exclusively to administrators."""
    queryset = AuditLog.objects.select_related('acting_user').all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        qs = super().get_queryset()
        action_val = self.request.query_params.get('action')
        entity_val = self.request.query_params.get('entity')
        user_val = self.request.query_params.get('user')
        search = self.request.query_params.get('search')

        if action_val:
            qs = qs.filter(action=action_val)
        if entity_val:
            qs = qs.filter(entity_type=entity_val)
        if user_val:
            qs = qs.filter(acting_user__username__icontains=user_val)
        if search:
            qs = qs.filter(details__icontains=search) | qs.filter(record_id__icontains=search)

        return qs
