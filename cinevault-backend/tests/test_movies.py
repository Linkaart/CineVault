import pytest
from rest_framework import status
from rest_framework.test import APIClient

from apps.movies.models import Movie


@pytest.mark.django_db
class TestMovieAPI:
    def test_list_movies_public(self, movie):
        client = APIClient()
        response = client.get("/api/movies/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1

    def test_retrieve_movie_detail(self, movie):
        client = APIClient()
        response = client.get(f"/api/movies/{movie.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == "Blade Runner"
        assert "overview" in response.data

    def test_search_movies_by_title(self, db):
        Movie.objects.create(tmdb_id=1, title="Dune")
        Movie.objects.create(tmdb_id=2, title="Arrival")
        client = APIClient()
        response = client.get("/api/movies/?search=Dune")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1
        assert response.data["results"][0]["title"] == "Dune"

    def test_movies_are_read_only(self, movie):
        client = APIClient()
        response = client.post("/api/movies/", {"tmdb_id": 99, "title": "Nouveau"})
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
