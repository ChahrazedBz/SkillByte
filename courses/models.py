import uuid

from django.conf import settings
from django.db import models

from users.models import User

LEVELS = (
    ("Beginner", "Beginner"),
    ("Intermediate", "Intermediate"),
    ("Advanced", "Advanced"),
)


class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True, blank=True, null=True)

    class Meta:
        verbose_name_plural = "categories"

    def __str__(self):
        return str(self.name)


class Course(models.Model):
    cid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=30)
    slug = models.SlugField(unique=True, null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    instructor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="courses",
        limit_choices_to={"role": "instructor"},
    )
    category = models.ManyToManyField(Category, blank=True, related_name="courses")
    duration = models.PositiveIntegerField(null=True, blank=True)
    duration_unit = models.CharField(max_length=20, default="hours")
    price = models.DecimalField(max_digits=8, decimal_places=2, default="0.00")
    level = models.CharField(max_length=20, choices=LEVELS, default="Beginner")
    is_active = models.BooleanField(default=True)
    certified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    thumbnail = models.ImageField(upload_to="course_thumbnails/", blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    def lesson_count(self):
        return self.lessons.count()

    def students_enrolled(self):
        return self.enrolled_students.count()

    def thumbnail_url(self):
        if self.thumbnail:
            return f"{settings.WEBSITE_URL}{self.thumbnail.url}"
        return f"{settings.WEBSITE_URL}default_thumbanl.png"

    @property
    def average_rating(self):
        avg = self.ratings.aggregate(models.Avg("rating"))["rating__avg"]
        return round(avg, 2) if avg else None

    @property
    def review_count(self):
        return self.ratings.count()

    def __str__(self):
        return str(self.title)


class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=100)
    content = models.TextField(blank=True, null=True)
    resources = models.FileField(upload_to="resources/", null=True, blank=True)
    video_url = models.URLField(max_length=255, null=True, blank=True)
    duration = models.PositiveIntegerField(null=True, blank=True)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ("course", "order")
        ordering = ["order"]

    def __str__(self):
        return str(self.title)


class Enroll(models.Model):
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="enrolled_students"
    )
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="enrollments",
        limit_choices_to={"role": "student"},
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "course")

    def __str__(self):
        return str(f"{self.student} enrolled in {self.course}")


class Rating(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="ratings")
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="ratings",
        limit_choices_to={"role": "student"},
    )
    rating = models.PositiveSmallIntegerField()
    review = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("course", "student")

    def __str__(self):
        return f"{self.student} rated {self.course} with {self.rating}"
