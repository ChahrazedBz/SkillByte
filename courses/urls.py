from django.urls import path

from . import views

urlpatterns = [
    path("courses/", views.courses_list, name="courses_list"),
    path("course/<uuid:pk>/", views.course_details, name="courses_details"),
]
