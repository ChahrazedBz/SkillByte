from rest_framework import serializers

from .models import *


# display all courses
class CourseListSerializers(serializers.ModelSerializer):
    instructor = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format="%Y-%m-%d")
    category = serializers.StringRelatedField(many=True)

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


class LessonListCreateUpdateSerializer(serializers.ModelSerializer):
    # WRITE: accept course ID
    course = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all()
    )

    # READ: return course slug
    course_slug = serializers.CharField(
        source="course.slug",
        read_only=True
    )

    class Meta:
        model = Lesson
        fields = [
            "course",
            "course_slug",
            "title",
            "content",
            "resources",
            "video_url",
            "duration",
            "duration_unit",
            "order",
        ]



class RatingSerializer(serializers.ModelSerializer):
    student = serializers.SerializerMethodField()

    class Meta:
        model = Rating
        fields = ["student", "rating", "review", "created_at"]

    def get_student(self, obj):
        return obj.student.get_full_name()


# display course by id
class CourseDetailSerializer(serializers.ModelSerializer):
    lessons = LessonListCreateUpdateSerializer(many=True, read_only=True)
    ratings = RatingSerializer(many=True, read_only=True)
    instructor = serializers.SerializerMethodField()
    category = serializers.StringRelatedField(many=True)

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
            "lessons",
            "ratings",
        )

    def get_instructor(self, obj):
        return obj.instructor.get_full_name()


# create or update course
class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = (
            "title",
            "description",
            "category",
            "duration",
            "duration_unit",
            "price",
            "level",
            "certified",
        )


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]
