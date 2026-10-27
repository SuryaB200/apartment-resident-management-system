from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SystemSettingViewSet, DashboardMetricsView, DefaultersLedgerView,
    SLAReportView, AcademicProjectInfoView
)

router = DefaultRouter()
router.register('settings', SystemSettingViewSet, basename='system-setting')

urlpatterns = [
    path('metrics/dashboard/', DashboardMetricsView.as_view(), name='dashboard-metrics'),
    path('metrics/defaulters/', DefaultersLedgerView.as_view(), name='defaulters-ledger'),
    path('metrics/sla/', SLAReportView.as_view(), name='sla-report'),
    path('capstone/info/', AcademicProjectInfoView.as_view(), name='academic-info'),
    path('', include(router.urls)),
]
