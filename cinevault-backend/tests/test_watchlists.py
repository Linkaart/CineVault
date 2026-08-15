import pytest
from rest_framework import status
from rest_framework.test import APIClient

from apps.watchlists.models import WatchList


@pytest.mark.django_db
class TestWatchListAPI:
    def test_create_watchlist_requires_auth(self):
        client = APIClient()
        response = client.post("/api/watchlists/", {"name": "Ma liste", "is_public": True})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_watchlist(self, user):
        client = APIClient()
        client.force_authenticate(user=user)
        response = client.post("/api/watchlists/", {"name": "Chefs-d'oeuvre", "is_public": True})
        assert response.status_code == status.HTTP_201_CREATED
        assert WatchList.objects.filter(user=user, name="Chefs-d'oeuvre").exists()

    def test_private_watchlist_hidden_from_others(self, user, other_user):
        WatchList.objects.create(user=user, name="Secrète", is_public=False)
        client = APIClient()
        client.force_authenticate(user=other_user)
        response = client.get("/api/watchlists/")
        assert response.status_code == status.HTTP_200_OK
        names = [w["name"] for w in response.data["results"]]
        assert "Secrète" not in names

    def test_add_movie_to_own_watchlist(self, user, movie):
        watchlist = WatchList.objects.create(user=user, name="Liste", is_public=True)
        client = APIClient()
        client.force_authenticate(user=user)
        response = client.post(
            f"/api/watchlists/{watchlist.id}/movies/", {"movie_id": movie.id, "position": 1}
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_cannot_add_movie_to_others_watchlist(self, user, other_user, movie):
        watchlist = WatchList.objects.create(user=other_user, name="Liste", is_public=True)
        client = APIClient()
        client.force_authenticate(user=user)
        response = client.post(
            f"/api/watchlists/{watchlist.id}/movies/", {"movie_id": movie.id, "position": 1}
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
