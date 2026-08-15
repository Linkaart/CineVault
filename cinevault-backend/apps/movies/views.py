from django.db.models import Avg, Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from .models import Genre, Movie
from .serializers import GenreSerializer, MovieDetailSerializer, MovieListSerializer


class GenreViewSet(viewsets.ReadOnlyModelViewSet):
    """Liste des genres disponibles (alimentée par la synchro TMDB)."""

    queryset = Genre.objects.all().order_by("name")
    serializer_class = GenreSerializer
    pagination_class = None


class MovieViewSet(viewsets.ReadOnlyModelViewSet):
    """Catalogue de films en lecture seule (alimenté par la synchro TMDB)."""

    queryset = Movie.objects.annotate(
        avg_rating=Avg("reviews__rating"), review_count=Count("reviews")
    ).order_by("-created_at")
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["genres", "release_date"]
    search_fields = ["title"]
    ordering_fields = ["avg_rating", "release_date", "title"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return MovieDetailSerializer
        return MovieListSerializer
