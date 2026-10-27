from django.contrib import admin
from .models import SystemSetting

@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'value', 'category', 'description', 'updated_at')
    list_filter = ('category',)
    search_fields = ('key', 'value', 'description')
