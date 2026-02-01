from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("courses", views.CourseViewSet, basename="courses")
router.register("categories", views.CategoryList, basename="categories")
router.register("lessons", views.LessonViewSet, basename="lessons")
urlpatterns = router.urls
