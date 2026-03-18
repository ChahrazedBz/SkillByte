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
            "cid",
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
            "is_approved",
        )

    def get_instructor(self, obj):
        return obj.instructor.get_full_name()


class LessonListCreateUpdateSerializer(serializers.ModelSerializer):
    # WRITE: accept course ID
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())

    # READ: return course slug
    course_slug = serializers.CharField(source="course.slug", read_only=True)

    class Meta:
        model = Lesson
        fields = [
            "id", 
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
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Rating
        fields = ["id", "course", "student", "student_name", "rating", "review", "created_at"]
        read_only_fields = ["student", "student_name", "created_at"]

    def get_student(self, obj):
        return str(obj.student.id)

    def get_student_name(self, obj):
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


class EnrollSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enroll
        fields = ["id", "course", "enrolled_at"]
        read_only_fields = ["enrolled_at"]


class RatingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ["course", "rating", "review"]

class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_id = serializers.PrimaryKeyRelatedField(
        source="lesson", queryset=Lesson.objects.all()
    )

    class Meta:
        model = LessonProgress
        fields = ["id", "lesson_id", "completed", "completed_at"]
        read_only_fields = ["completed_at"]

class CourseDetailSerializer(serializers.ModelSerializer):
    lessons = LessonListCreateUpdateSerializer(many=True, read_only=True)
    ratings = RatingSerializer(many=True, read_only=True)
    instructor = serializers.SerializerMethodField()
    category = serializers.StringRelatedField(many=True)
    students_count = serializers.SerializerMethodField()   # ← ADD

    class Meta:
        model = Course
        fields = (
            "cid", "title", "description", "instructor",
            "category", "duration", "price", "level",
            "certified", "thumbnail_url", "lesson_count",
            "created_at", "lessons", "ratings",
            "average_rating", "review_count",
            "students_count",    # ← ADD
        )

    def get_instructor(self, obj):
        return obj.instructor.get_full_name()

    def get_students_count(self, obj):
        return obj.enrolled_students.count()