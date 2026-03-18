from django.contrib import admin
from .models import Course, Category, Lesson, Enroll, Rating

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["title", "instructor", "is_approved", "created_at"]
    list_filter = ["is_approved", "level"]
    actions = ["approve_courses"]

    def approve_courses(self, request, queryset):
        queryset.update(is_approved=True)
        self.message_user(request, f"{queryset.count()} course(s) approved.")
    approve_courses.short_description = "Approve selected courses"

admin.register(Category)(admin.ModelAdmin)
admin.register(Lesson)(admin.ModelAdmin)