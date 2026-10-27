from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import ServiceTicket
from .serializers import ServiceTicketSerializer
from apps.accounts.models import StaffProfile
from apps.accounts.permissions import IsStaffOrAdminRole
from apps.audit.models import log_event

class ServiceTicketViewSet(viewsets.ModelViewSet):
    queryset = ServiceTicket.objects.select_related('flat__building', 'resident', 'assigned_staff__user').all()
    serializer_class = ServiceTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.role == 'RESIDENT' and not user.is_superuser:
            qs = qs.filter(resident__user=user)
        elif user.role == 'STAFF' and hasattr(user, 'staff_profile') and not user.is_superuser:
            # If staff user, can see assigned tickets or open unassigned tickets
            qs = qs.filter(assigned_staff=user.staff_profile) | qs.filter(status='OPEN')

        category = self.request.query_params.get('category')
        priority = self.request.query_params.get('priority')
        status_val = self.request.query_params.get('status')
        staff_id = self.request.query_params.get('staff')
        search = self.request.query_params.get('search')

        if category:
            qs = qs.filter(category=category)
        if priority:
            qs = qs.filter(priority=priority)
        if status_val:
            qs = qs.filter(status=status_val)
        if staff_id:
            qs = qs.filter(assigned_staff_id=staff_id)
        if search:
            qs = qs.filter(title__icontains=search) | qs.filter(ticket_number__icontains=search) | qs.filter(description__icontains=search)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        resident = serializer.validated_data.get('resident')
        flat = serializer.validated_data.get('flat')

        # If resident is submitting, ensure it's their own flat and profile
        if user.role == 'RESIDENT' and not user.is_superuser:
            if hasattr(user, 'resident_profile'):
                resident = user.resident_profile
                active_flat = resident.current_flat
                if active_flat:
                    flat = active_flat

        tkt_num = f"TKT-{timezone.now().strftime('%Y%m')}-{ServiceTicket.objects.count() + 1001}"
        instance = serializer.save(
            ticket_number=tkt_num,
            resident=resident,
            flat=flat,
            status='OPEN'
        )
        log_event(
            user, 'CREATE', 'ServiceTicket', instance.id,
            f"Created ticket {instance.ticket_number}: {instance.title} for Flat {instance.flat.full_flat_code}"
        )

    @action(detail=True, methods=['post'])
    def transition(self, request, pk=None):
        """
        Transition ticket through state machine:
        OPEN -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED
        """
        ticket = self.get_object()
        target_status = request.data.get('status')
        staff_id = request.data.get('staff_id')
        notes = request.data.get('notes')
        rating = request.data.get('feedback_rating')

        user = request.user
        staff_instance = None

        if staff_id:
            if not (user.role in ('ADMIN', 'STAFF') or user.is_superuser):
                return Response({'error': 'Only administrators or staff can assign technicians.'}, status=status.HTTP_403_FORBIDDEN)
            try:
                staff_instance = StaffProfile.objects.get(pk=staff_id)
            except StaffProfile.DoesNotExist:
                return Response({'error': 'Assigned staff member not found.'}, status=status.HTTP_404_NOT_FOUND)

        if rating:
            ticket.feedback_rating = rating

        try:
            ticket.transition_to(target_status, user=user, notes=notes, staff=staff_instance)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        log_event(
            user, 'TICKET_TRANSITION', 'ServiceTicket', ticket.id,
            f"Transitioned {ticket.ticket_number} to {target_status} by {user.username}"
        )

        serializer = self.get_serializer(ticket)
        return Response(serializer.data)
