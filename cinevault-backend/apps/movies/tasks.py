import logging

from celery import shared_task

from .models import Genre, Movie
from .services.tmdb_client import TMDBClient

logger = logging.getLogger(__name__)


@shared_task
def sync_genres():
    client = TMDBClient()
    data = client.get_genres()
    count = 0
    for g in data.get("genres", []):
        Genre.objects.update_or_create(tmdb_id=g["id"], defaults={"name": g["name"]})
        count += 1
    logger.info("Synced %s genres from TMDB", count)
    return count


def upsert_movie_from_tmdb(m):
    """Crée ou met à jour un Movie local à partir d'un résultat TMDB (popular/search)."""
    movie, _ = Movie.objects.update_or_create(
        tmdb_id=m["id"],
        defaults={
            "title": m["title"],
            "overview": m.get("overview", ""),
            "release_date": m.get("release_date") or None,
            "poster_url": (
                f"https://image.tmdb.org/t/p/w500{m['poster_path']}"
                if m.get("poster_path")
                else ""
            ),
            "vote_average_tmdb": m.get("vote_average", 0),
        },
    )
    genre_ids = m.get("genre_ids", [])
    if genre_ids:
        movie.genres.set(Genre.objects.filter(tmdb_id__in=genre_ids))
    return movie


@shared_task
def sync_popular_movies(pages=5):
    client = TMDBClient()
    count = 0
    for page in range(1, pages + 1):
        data = client.get_popular_movies(page=page)
        for m in data.get("results", []):
            upsert_movie_from_tmdb(m)
            count += 1
    logger.info("Synced %s movies from TMDB", count)
    return count
