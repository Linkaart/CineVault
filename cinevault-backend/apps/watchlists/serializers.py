from rest_framework import serializers

from apps.movies.serializers import MovieListSerializer

from .models import ListEntry, WatchList


class ListEntrySerializer(serializers.ModelSerializer):
    movie = MovieListSerializer(read_only=True)
    movie_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ListEntry
        fields = ["id", "movie", "movie_id", "position", "note"]

    def create(self, validated_data):
        movie_id = validated_data.pop("movie_id")
        return ListEntry.objects.create(movie_id=movie_id, **validated_data)


class WatchListSerializer(serializers.ModelSerializer):
    entries = ListEntrySerializer(many=True, read_only=True)
    movie_count = serializers.SerializerMethodField()
    owner_username = serializers.CharField(source="user.username", read_only=True)

    def get_movie_count(self, obj):
        # Utilise le cache de prefetch_related plutôt qu'un COUNT(*) par liste.
        return len(obj.entries.all())

    class Meta:
        model = WatchList
        fields = [
            "id",
            "user",
            "owner_username",
            "name",
            "description",
            "is_public",
            "entries",
            "movie_count",
            "created_at",
        ]
        read_only_fields = ["user"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
