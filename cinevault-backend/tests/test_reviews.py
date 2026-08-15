import pytest
from rest_framework import status
from rest_framework.test import APIClient

from apps.reviews.models import Review


@pytest.mark.django_db
class TestReviewAPI:
    def test_create_review_requires_auth(self, movie):
        client = APIClient()
        response = client.post("/api/reviews/", {"movie": movie.id, "rating": 9, "content": "Génial"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_review_authenticated(self, user, movie):
        client = APIClient()
        client.force_authenticate(user=user)
        response = client.post("/api/reviews/", {"movie": movie.id, "rating": 9, "content": "Génial"})
        assert response.status_code == status.HTTP_201_CREATED
        assert Review.objects.filter(user=user, movie=movie, rating=9).exists()

    def test_rating_out_of_range_rejected(self, user, movie):
        client = APIClient()
        client.force_authenticate(user=user)
        response = client.post("/api/reviews/", {"movie": movie.id, "rating": 15, "content": "Trop"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_cannot_edit_others_review(self, user, other_user, movie):
        review = Review.objects.create(user=other_user, movie=movie, rating=7, content="Ok")
        client = APIClient()
        client.force_authenticate(user=user)
        response = client.patch(f"/api/reviews/{review.id}/", {"rating": 1})
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_duplicate_review_same_movie_rejected(self, user, movie):
        Review.objects.create(user=user, movie=movie, rating=8, content="Première")
        client = APIClient()
        client.force_authenticate(user=user)
        response = client.post("/api/reviews/", {"movie": movie.id, "rating": 5, "content": "Deuxième"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_filter_reviews_by_movie(self, user, other_user, movie):
        Review.objects.create(user=user, movie=movie, rating=8, content="A")
        client = APIClient()
        response = client.get(f"/api/reviews/?movie={movie.id}")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1
