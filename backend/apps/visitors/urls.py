from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VisitorLogViewSet

router = DefaultRouter()
router.register('logs', VisitorLogViewSet, basename='visitor-log')

urlpatterns = [
    path('', include(router.urls)),
]
