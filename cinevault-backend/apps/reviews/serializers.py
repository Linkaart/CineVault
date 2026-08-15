from rest_framework import serializers

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
    movie_title = serializers.CharField(source="movie.title", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "movie",
            "movie_title",
            "user",
            "user_username",
            "rating",
            "content",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["user", "created_at", "updated_at"]

    def validate_rating(self, value):
        if not 1 <= value <= 10:
            raise serializers.ValidationError("La note doit être comprise entre 1 et 10.")
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        movie = attrs.get("movie")
        if request and movie and not self.instance:
            if Review.objects.filter(user=request.user, movie=movie).exists():
                raise serializers.ValidationError(
                    "Tu as déjà publié une critique pour ce film."
                )
        return attrs

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
