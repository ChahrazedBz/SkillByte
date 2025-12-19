from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
)
from rest_framework.response import Response

from .models import Course
from .permission import isInstructor, isOwnerInstructor
from .serializers import (
    CourseCreateUpdateSerializer,
    CourseDetailSerializer,
    CourseListSerializers,
)

# @api_view(["GET"])
# @permission_classes([AllowAny])
# @authentication_classes([])
# def courses_list(request):
#     courses = Course.objects.all()
#     serializers = CourseListSrializers(courses, many=True)
#     return Response(serializers.data)


# @api_view(["GET"])
# @permission_classes([AllowAny])
# def course_details(request, pk):
#     course = get_object_or_404(Course, pk=pk)
#     serializers = CourseListSrializers(course)
#     return Response(serializers.data)


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        elif self.action == "create":
            return [IsAuthenticated(), isInstructor()]
        elif self.action in ["update", "partial_update", "destroy"]:
            return [IsAuthenticated(), isInstructor(), isOwnerInstructor()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return CourseDetailSerializer
        elif self.action in ["upadte", "partial_update"]:
            return CourseCreateUpdateSerializer
        return CourseListSerializers

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)
