from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Amenity, AmenityBooking
from .serializers import AmenitySerializer, AmenityBookingSerializer
from apps.accounts.permissions import IsStaffOrAdminRole
from apps.audit.models import log_event

class AmenityViewSet(viewsets.ModelViewSet):
    queryset = Amenity.objects.all().order_by('name')
    serializer_class = AmenitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save()
        log_event(self.request.user, 'CREATE', 'Amenity', instance.id, f"Created amenity {instance.name}")

    def perform_update(self, serializer):
        instance = serializer.save()
        log_event(self.request.user, 'UPDATE', 'Amenity', instance.id, f"Updated amenity {instance.name}")


class AmenityBookingViewSet(viewsets.ModelViewSet):
    queryset = AmenityBooking.objects.select_related('amenity', 'resident', 'flat__building').all()
    serializer_class = AmenityBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.role == 'RESIDENT' and not user.is_superuser:
            # Resident can view all confirmed bookings to check calendar schedule, but only update their own
            user_only = self.request.query_params.get('my_bookings')
            if user_only and user_only.lower() in ('true', '1'):
                qs = qs.filter(resident__user=user)

        amenity_id = self.request.query_params.get('amenity')
        booking_date = self.request.query_params.get('date')
        status_val = self.request.query_params.get('status')

        if amenity_id:
            qs = qs.filter(amenity_id=amenity_id)
        if booking_date:
            qs = qs.filter(booking_date=booking_date)
        if status_val:
            qs = qs.filter(status=status_val)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        resident = serializer.validated_data.get('resident')
        flat = serializer.validated_data.get('flat')

        if user.role == 'RESIDENT' and not user.is_superuser:
            if hasattr(user, 'resident_profile'):
                resident = user.resident_profile
                active_flat = resident.current_flat
                if active_flat:
                    flat = active_flat

        ref = f"BKG-{timezone.now().strftime('%Y%m')}-{AmenityBooking.objects.count() + 1001}"
        instance = serializer.save(
            booking_reference=ref,
            resident=resident,
            flat=flat,
            status='CONFIRMED'
        )
        log_event(
            user, 'BOOKING_CREATED', 'AmenityBooking', instance.id,
            f"Reservation #{instance.booking_reference}: {instance.amenity.name} for Flat {instance.flat.full_flat_code} on {instance.booking_date} ({instance.start_time}-{instance.end_time})"
        )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancels reservation and frees up facility time slot."""
        booking = self.get_object()
        user = request.user
        if user.role == 'RESIDENT' and not user.is_superuser and booking.resident.user != user:
            return Response({'error': 'You can only cancel your own reservations.'}, status=status.HTTP_403_FORBIDDEN)

        booking.cancel()
        log_event(
            user, 'BOOKING_CANCELLED', 'AmenityBooking', booking.id,
            f"Cancelled reservation #{booking.booking_reference} for {booking.amenity.name}"
        )
        serializer = self.get_serializer(booking)
        return Response(serializer.data)
