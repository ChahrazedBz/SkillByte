from rest_framework.permissions import BasePermission
from .models import Course

class isInstructor(BasePermission):
    def has_permission(self, request, view):
        return(
            request.user.is_authenticated
            and request.user.role =="instructor"
        )

class isOwnerInstructor(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.instructor==request.user
    