from django.contrib import admin
from .models import User, StaffProfile

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active', 'is_superuser')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone')
    ordering = ('username',)

@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'user', 'designation', 'shift', 'phone', 'is_available')
    list_filter = ('designation', 'shift', 'is_available')
    search_fields = ('employee_id', 'user__username', 'user__first_name', 'user__last_name', 'phone')
    ordering = ('employee_id',)
