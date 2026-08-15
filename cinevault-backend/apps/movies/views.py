import logging

from django.db.models import Avg, Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from .models import Genre, Movie
from .serializers import GenreSerializer, MovieDetailSerializer, MovieListSerializer
from .services.tmdb_client import TMDBClient
from .tasks import upsert_movie_from_tmdb

logger = logging.getLogger(__name__)


class GenreViewSet(viewsets.ReadOnlyModelViewSet):
    """Liste des genres disponibles (alimentée par la synchro TMDB)."""

    queryset = Genre.objects.all().order_by("name")
    serializer_class = GenreSerializer
    pagination_class = None


class MovieViewSet(viewsets.ReadOnlyModelViewSet):
    """Catalogue de films en lecture seule (alimenté par la synchro TMDB)."""

    queryset = (
        Movie.objects.annotate(
            avg_rating=Avg("reviews__rating"), review_count=Count("reviews")
        )
        .prefetch_related("genres")
        .order_by("-created_at")
    )
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["genres", "release_date"]
    search_fields = ["title"]
    ordering_fields = ["avg_rating", "release_date", "title"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return MovieDetailSerializer
        return MovieListSerializer

    def list(self, request, *args, **kwargs):
        search = request.query_params.get("search")
        if search:
            self._sync_search_from_tmdb(search)
        return super().list(request, *args, **kwargs)

    def _sync_search_from_tmdb(self, query):
        """Importe à la volée les résultats TMDB correspondant à la recherche,
        pour que la recherche porte sur tout le catalogue TMDB et pas
        seulement les films déjà synchronisés localement."""
        try:
            data = TMDBClient().search_movies(query)
        except Exception:
            logger.exception("TMDB search failed for query=%r", query)
            return
        for m in data.get("results", [])[:20]:
            upsert_movie_from_tmdb(m)
