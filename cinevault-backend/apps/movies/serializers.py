from rest_framework import serializers

from .models import Genre, Movie


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "name"]


class MovieListSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    avg_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Movie
        fields = [
            "id",
            "tmdb_id",
            "title",
            "poster_url",
            "release_date",
            "genres",
            "avg_rating",
            "review_count",
        ]


class MovieDetailSerializer(MovieListSerializer):
    class Meta(MovieListSerializer.Meta):
        fields = MovieListSerializer.Meta.fields + ["overview", "runtime", "director"]
