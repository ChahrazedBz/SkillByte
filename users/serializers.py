from rest_framework import serializers
from django.contrib.auth import password_validation
from .models import User


class RegisterSerializers(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "password"]

    # validate email
    def validate(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    # create new user
    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "country",
            "role",
            "profile_img",
            "is_active",
        ]
        read_only_fields = ["role", "is_active"]

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class PasswordSerializer(serializers.Serializer):
    old_password=serializers.CharField(write_only=True,required=True)
    new_password=serializers.CharField(write_only=True,required=True)

    def validate_new_password(self, value):
        password_validation.validate_password(value)
        return value
