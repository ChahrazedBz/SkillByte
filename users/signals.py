from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import InstructorProfile, StudentProfile, User


@receiver(post_save, sender=User)
def create_profile(instance, created, **kwargs):
    if created:
        if instance.role == "student":
            StudentProfile.objects.create(user=instance)
        elif instance.role == "instructor":
            InstructorProfile.objects.create(user=instance)
