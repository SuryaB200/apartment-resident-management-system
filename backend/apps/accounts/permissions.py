from rest_framework import permissions

class IsAdminRole(permissions.BasePermission):
    """Allows access only to users with role=ADMIN or is_superuser."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_superuser))

class IsStaffOrAdminRole(permissions.BasePermission):
    """Allows access to users with role in (ADMIN, STAFF) or staff flag."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role in ('ADMIN', 'STAFF') or request.user.is_staff or request.user.is_superuser))

class IsResidentOrAdmin(permissions.BasePermission):
    """Allows residents to view/manage their own records, or Admins to view/manage all."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN' or request.user.is_superuser:
            return True
        # Check if object is directly or indirectly tied to request.user
        if hasattr(obj, 'user') and obj.user == request.user:
            return True
        if hasattr(obj, 'resident') and hasattr(obj.resident, 'user') and obj.resident.user == request.user:
            return True
        return False
