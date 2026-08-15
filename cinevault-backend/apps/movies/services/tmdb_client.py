import requests
from django.conf import settings

TMDB_BASE_URL = "https://api.themoviedb.org/3"


class TMDBClient:
    """Client minimal pour interroger l'API publique TMDB."""

    def __init__(self):
        self.api_key = settings.TMDB_API_KEY
        self.session = requests.Session()

    def _get(self, endpoint, params=None):
        params = params or {}
        params["api_key"] = self.api_key
        response = self.session.get(f"{TMDB_BASE_URL}{endpoint}", params=params, timeout=10)
        response.raise_for_status()
        return response.json()

    def get_popular_movies(self, page=1):
        return self._get("/movie/popular", {"page": page})

    def get_movie_details(self, tmdb_id):
        return self._get(f"/movie/{tmdb_id}", {"append_to_response": "credits"})

    def get_genres(self):
        return self._get("/genre/movie/list")

    def search_movies(self, query, page=1):
        return self._get("/search/movie", {"query": query, "page": page})
