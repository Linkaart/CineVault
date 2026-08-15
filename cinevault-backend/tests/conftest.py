import pytest
from django.contrib.auth import get_user_model

from apps.movies.models import Genre, Movie

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(username="alice", password="pass1234", email="alice@example.com")


@pytest.fixture
def other_user(db):
    return User.objects.create_user(username="bob", password="pass1234", email="bob@example.com")


@pytest.fixture
def genre_scifi(db):
    return Genre.objects.create(tmdb_id=878, name="Science-Fiction")


@pytest.fixture
def movie(db):
    return Movie.objects.create(tmdb_id=1, title="Blade Runner", overview="...")
