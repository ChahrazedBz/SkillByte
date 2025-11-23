from rest_framework import serializers

from .models import Course


class CourseListSrializers(serializers.ModelSerializer):
    instructor = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format="%Y-%m-%d")
    category=serializers.StringRelatedField(many=True)

    class Meta:
        model = Course
        fields = (
            "title",
            "description",
            "instructor",
            "category",
            "duration",
            "price",
            "level",
            "certified",
            "thumbnail_url",
            "lesson_count",
            "created_at",
        )

    def get_instructor(self, obj):
        return obj.instructor.get_full_name()
