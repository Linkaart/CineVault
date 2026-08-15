import pytest
from django.contrib.auth import get_user_model

from apps.movies.models import Movie
from apps.recommendations.engine import compute_recommendations_for_user, save_recommendations
from apps.recommendations.models import Recommendation
from apps.reviews.models import Review

User = get_user_model()


@pytest.fixture
def movies(db, genre_scifi):
    m1 = Movie.objects.create(tmdb_id=1, title="Dune")
    m2 = Movie.objects.create(tmdb_id=2, title="Arrival")
    m3 = Movie.objects.create(tmdb_id=3, title="Interstellar")
    for m in (m1, m2, m3):
        m.genres.add(genre_scifi)
    return m1, m2, m3


@pytest.mark.django_db
class TestRecommendationEngine:
    def test_cold_start_uses_genre_fallback(self, movies):
        m1, m2, m3 = movies
        newbie = User.objects.create_user(username="newbie", password="pass1234")
        Review.objects.create(user=newbie, movie=m1, rating=8, content="Top")

        rater = User.objects.create_user(username="rater", password="pass1234")
        Review.objects.create(user=rater, movie=m2, rating=9, content="")
        rater2 = User.objects.create_user(username="rater2", password="pass1234")
        Review.objects.create(user=rater2, movie=m2, rating=8, content="")

        results = compute_recommendations_for_user(newbie)
        recommended_movies = [r[0] for r in results]

        assert m1 not in recommended_movies
        assert m2 in recommended_movies

    def test_collaborative_filtering_recommends_similar_users_picks(self, movies):
        m1, m2, m3 = movies
        alice = User.objects.create_user(username="alice2", password="pass1234")
        twin = User.objects.create_user(username="twin", password="pass1234")

        m4 = Movie.objects.create(tmdb_id=4, title="Ex Machina")
        m5 = Movie.objects.create(tmdb_id=5, title="Her")

        Review.objects.create(user=alice, movie=m1, rating=9, content="")
        Review.objects.create(user=alice, movie=m4, rating=8, content="")
        Review.objects.create(user=alice, movie=m5, rating=7, content="")

        Review.objects.create(user=twin, movie=m1, rating=9, content="")
        Review.objects.create(user=twin, movie=m4, rating=8, content="")
        Review.objects.create(user=twin, movie=m2, rating=9, content="")

        results = compute_recommendations_for_user(alice)
        recommended_movies = [r[0] for r in results]
        assert m2 in recommended_movies

    def test_save_recommendations_persists_and_does_not_duplicate(self, movies):
        m1, m2, m3 = movies
        alice = User.objects.create_user(username="alice3", password="pass1234")
        Review.objects.create(user=alice, movie=m1, rating=9, content="")

        save_recommendations(alice)
        first_count = Recommendation.objects.filter(user=alice).count()

        save_recommendations(alice)
        second_count = Recommendation.objects.filter(user=alice).count()

        assert first_count == second_count

    def test_refresh_endpoint(self, movies, client=None):
        from rest_framework.test import APIClient
        m1, m2, m3 = movies
        alice = User.objects.create_user(username="alice4", password="pass1234")
        Review.objects.create(user=alice, movie=m1, rating=9, content="")

        api_client = APIClient()
        api_client.force_authenticate(user=alice)
        response = api_client.post("/api/recommendations/refresh/")
        assert response.status_code == 200
        assert "recommendations_generated" in response.data
