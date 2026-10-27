from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OccupancyHistoryViewSet

router = DefaultRouter()
router.register('', OccupancyHistoryViewSet, basename='occupancy-history')

urlpatterns = [
    path('', include(router.urls)),
]
