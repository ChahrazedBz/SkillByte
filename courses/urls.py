from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("courses", views.CourseViewSet, basename="courses")
router.register("categories", views.CategoryList, basename="categories")
router.register("lessons", views.LessonViewSet, basename="lessons")
router.register("enrollments", views.EnrollViewSet, basename="enrollments")
router.register("ratings", views.RatingViewSet, basename="ratings")
router.register("progress", views.LessonProgressViewSet, basename="progress")
urlpatterns = router.urls
