from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LateFeePolicyViewSet, MaintenanceInvoiceViewSet, PaymentViewSet

router = DefaultRouter()
router.register('policies', LateFeePolicyViewSet, basename='late-fee-policy')
router.register('invoices', MaintenanceInvoiceViewSet, basename='maintenance-invoice')
router.register('payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
]
