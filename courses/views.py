from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import (
    action,
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
from django.utils import timezone
from .models import *
from .permission import isInstructor, isOwnerInstructor
from .serializers import (
    CategorySerializer,
    CourseCreateUpdateSerializer,
    CourseDetailSerializer,
    CourseListSerializers,
    EnrollSerializer,
    LessonListCreateUpdateSerializer,
    RatingSerializer,
    LessonProgressSerializer
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

    def get_queryset(self):
        if self.action in ["list", "retrieve"]:
            return Course.objects.filter(is_approved=True)  # ← only approved
        return Course.objects.all()

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
        elif self.action in ["create", "update", "partial_update"]:  # ← add "create"
            return CourseCreateUpdateSerializer
        return CourseListSerializers

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonListCreateUpdateSerializer

    def get_queryset(self):
        queryset = Lesson.objects.all()
        course_id = self.request.query_params.get("course")
        if course_id:
            queryset = queryset.filter(course__cid=course_id)
        return queryset

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), isInstructor()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save()


class CategoryList(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class EnrollViewSet(viewsets.ModelViewSet):
    queryset = Enroll.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        from .serializers import EnrollSerializer

        return EnrollSerializer

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    def get_queryset(self):
        return Enroll.objects.filter(student=self.request.user)


class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        return RatingSerializer

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)





class LessonProgressViewSet(viewsets.ModelViewSet):
    serializer_class = LessonProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LessonProgress.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(
            student=self.request.user,
            completed_at=timezone.now() if serializer.validated_data.get("completed") else None
        )

    def perform_update(self, serializer):
        completed = serializer.validated_data.get("completed", False)
        serializer.save(
            completed_at=timezone.now() if completed else None
        )