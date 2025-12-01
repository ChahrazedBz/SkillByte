from rest_framework import serializers

from .models import User


class RegisterSerializers(serializers.ModelSerializer):
    password=serializers.CharField(write_only=True,required=True)

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "password"]

    # check email if exists before
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    # create new  user
    def create(self, validated_data):
        passwrod = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(passwrod)
        user.save()
        return user
