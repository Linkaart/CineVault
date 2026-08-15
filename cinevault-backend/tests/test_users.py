import pytest
from rest_framework import status
from rest_framework.test import APIClient


@pytest.mark.django_db
class TestUserProfileAPI:
    def test_update_own_profile_requires_auth(self):
        client = APIClient()
        response = client.patch("/api/users/me/", {"bio": "Nouvelle bio"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_own_bio(self, user):
        client = APIClient()
        client.force_authenticate(user=user)
        response = client.patch("/api/users/me/", {"bio": "Fan de cinéma d'auteur"})
        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.bio == "Fan de cinéma d'auteur"

    def test_update_favorite_genres(self, user, genre_scifi):
        client = APIClient()
        client.force_authenticate(user=user)
        response = client.patch(
            "/api/users/me/", {"favorite_genres": [genre_scifi.id]}, format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert list(user.favorite_genres.values_list("id", flat=True)) == [genre_scifi.id]

    def test_cannot_update_another_users_profile_via_me_endpoint(self, user, other_user):
        client = APIClient()
        client.force_authenticate(user=user)
        response = client.patch("/api/users/me/", {"bio": "Usurpation ?"})
        assert response.status_code == status.HTTP_200_OK
        other_user.refresh_from_db()
        assert other_user.bio != "Usurpation ?"

    def test_list_genres_is_public(self, genre_scifi):
        client = APIClient()
        response = client.get("/api/genres/")
        assert response.status_code == status.HTTP_200_OK
        names = [g["name"] for g in response.data]
        assert "Science-Fiction" in names
