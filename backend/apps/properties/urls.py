from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BuildingViewSet, FlatViewSet

router = DefaultRouter()
router.register('buildings', BuildingViewSet, basename='building')
router.register('flats', FlatViewSet, basename='flat')

urlpatterns = [
    path('', include(router.urls)),
]
