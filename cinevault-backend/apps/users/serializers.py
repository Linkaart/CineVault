from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db.models import Count
from rest_framework import serializers

from apps.movies.models import Genre
from apps.movies.serializers import GenreSerializer

from .models import Follow

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    followers_count = serializers.IntegerField(source="followers.count", read_only=True)
    following_count = serializers.IntegerField(source="following.count", read_only=True)
    reviews_count = serializers.IntegerField(source="reviews.count", read_only=True)
    favorite_genres_detail = GenreSerializer(source="favorite_genres", many=True, read_only=True)
    top_genres = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "bio",
            "avatar",
            "favorite_genres",
            "favorite_genres_detail",
            "top_genres",
            "followers_count",
            "following_count",
            "reviews_count",
            "date_joined",
        ]

    def get_top_genres(self, obj):
        """Genres les plus fréquents parmi les films bien notés (>= 7) par l'utilisateur."""
        genres = (
            Genre.objects.filter(movies__reviews__user=obj, movies__reviews__rating__gte=7)
            .annotate(count=Count("movies__reviews"))
            .order_by("-count")[:5]
        )
        return GenreSerializer(genres, many=True).data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class FollowSerializer(serializers.ModelSerializer):
    follower_username = serializers.CharField(source="follower.username", read_only=True)
    following_username = serializers.CharField(source="following.username", read_only=True)

    class Meta:
        model = Follow
        fields = ["id", "follower", "follower_username", "following", "following_username", "created_at"]
        read_only_fields = ["follower"]
