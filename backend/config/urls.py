from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Capstone Domain Modules
    path('api/', include('apps.accounts.urls')),
    path('api/properties/', include('apps.properties.urls')),
    path('api/residents/', include('apps.residents.urls')),
    path('api/occupancy/', include('apps.occupancy.urls')),
    path('api/billing/', include('apps.billing.urls')),
    path('api/maintenance/', include('apps.maintenance.urls')),
    path('api/visitors/', include('apps.visitors.urls')),
    path('api/amenities/', include('apps.amenities.urls')),
    path('api/parking/', include('apps.parking.urls')),
    path('api/reporting/', include('apps.reporting.urls')),
    path('api/audit/', include('apps.audit.urls')),
]
