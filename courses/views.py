from django.shortcuts import get_object_or_404
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Course
from .serializers import CourseListSrializers


@api_view(["GET"])
@permission_classes([AllowAny])
@authentication_classes([])
def courses_list(request):
    courses = Course.objects.all()
    serializers = CourseListSrializers(courses, many=True)
    return Response(serializers.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def course_details(request, pk):
    course = get_object_or_404(Course, pk=pk)
    serializers = CourseListSrializers(course)
    return Response(serializers.data)
