from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AmenityViewSet, AmenityBookingViewSet

router = DefaultRouter()
router.register('facilities', AmenityViewSet, basename='amenity')
router.register('reservations', AmenityBookingViewSet, basename='amenity-booking')

urlpatterns = [
    path('', include(router.urls)),
]
