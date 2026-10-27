from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceTicketViewSet

router = DefaultRouter()
router.register('tickets', ServiceTicketViewSet, basename='service-ticket')

urlpatterns = [
    path('', include(router.urls)),
]
