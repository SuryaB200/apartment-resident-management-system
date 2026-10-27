from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ParkingSlotViewSet, ParkingAllocationViewSet

router = DefaultRouter()
router.register('slots', ParkingSlotViewSet, basename='parking-slot')
router.register('allocations', ParkingAllocationViewSet, basename='parking-allocation')

urlpatterns = [
    path('', include(router.urls)),
]
