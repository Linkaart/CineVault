"""
Moteur de recommandation de CineVault.

Deux stratégies selon l'historique de l'utilisateur :
- Cold start (< MIN_REVIEWS_FOR_COLLAB critiques) : recommandation par affinité
  de genres, basée sur les films les mieux notés par l'utilisateur.
- Filtrage collaboratif (>= MIN_REVIEWS_FOR_COLLAB) : identification des
  utilisateurs aux notations similaires sur les films en commun, puis
  recommandation de leurs coups de coeur non encore vus.
"""

from collections import defaultdict

from django.db.models import Avg, Count

from apps.movies.models import Movie
from apps.reviews.models import Review

from .models import Recommendation

MIN_REVIEWS_FOR_COLLAB = 3
LIKED_RATING_THRESHOLD = 7
MAX_RESULTS = 20


def compute_recommendations_for_user(user):
    user_reviews = Review.objects.filter(user=user).select_related("movie")

    if user_reviews.count() < MIN_REVIEWS_FOR_COLLAB:
        return _genre_based_fallback(user_reviews)

    return _collaborative_filtering(user_reviews)


def _genre_based_fallback(user_reviews):
    """Cold start : recommande selon les genres préférés (notes hautes)."""
    liked_genre_ids = set()
    for review in user_reviews.filter(rating__gte=LIKED_RATING_THRESHOLD):
        liked_genre_ids.update(review.movie.genres.values_list("id", flat=True))

    seen_movie_ids = user_reviews.values_list("movie_id", flat=True)

    if not liked_genre_ids:
        # Aucun film "aimé" pour l'instant : on retombe sur les mieux notés du site
        candidates = (
            Movie.objects.exclude(id__in=seen_movie_ids)
            .annotate(avg_rating=Avg("reviews__rating"), review_count=Count("reviews"))
            .filter(review_count__gte=2)
            .order_by("-avg_rating")[:MAX_RESULTS]
        )
        return [
            (movie, movie.avg_rating or 0, "Parmi les mieux notés de CineVault")
            for movie in candidates
        ]

    candidates = (
        Movie.objects.filter(genres__id__in=liked_genre_ids)
        .exclude(id__in=seen_movie_ids)
        .annotate(avg_rating=Avg("reviews__rating"), review_count=Count("reviews"))
        .distinct()
        .order_by("-avg_rating")[:MAX_RESULTS]
    )

    return [
        (movie, movie.avg_rating or 0, "Basé sur tes genres préférés")
        for movie in candidates
    ]


def _collaborative_filtering(user_reviews):
    """Filtrage collaboratif item/user simplifié, sans dépendance ML lourde."""
    user_ratings = {r.movie_id: r.rating for r in user_reviews}
    seen_movie_ids = set(user_ratings.keys())
    review_user_id = user_reviews.first().user_id

    neighbor_reviews = (
        Review.objects.filter(movie_id__in=seen_movie_ids)
        .exclude(user_id=review_user_id)
        .select_related("movie", "user")
    )

    # Similarité simplifiée : écart moyen de notes sur les films communs
    neighbor_diffs = defaultdict(list)
    for review in neighbor_reviews:
        diff = abs(review.rating - user_ratings[review.movie_id])
        neighbor_diffs[review.user_id].append(diff)

    similarity = {
        uid: max(0.0, 1 - (sum(diffs) / len(diffs)) / 10)
        for uid, diffs in neighbor_diffs.items()
    }
    top_neighbors = sorted(similarity.items(), key=lambda x: -x[1])[:15]
    neighbor_ids = [uid for uid, _ in top_neighbors]

    if not neighbor_ids:
        return []

    candidate_reviews = (
        Review.objects.filter(user_id__in=neighbor_ids, rating__gte=LIKED_RATING_THRESHOLD)
        .exclude(movie_id__in=seen_movie_ids)
        .select_related("movie")
    )

    movie_scores = defaultdict(list)
    for review in candidate_reviews:
        weight = similarity.get(review.user_id, 0)
        movie_scores[review.movie].append(review.rating * weight)

    scored = [
        (movie, sum(scores) / len(scores)) for movie, scores in movie_scores.items()
    ]
    scored.sort(key=lambda x: -x[1])

    return [
        (movie, score, "Des utilisateurs aux goûts similaires ont aimé")
        for movie, score in scored[:MAX_RESULTS]
    ]


def save_recommendations(user):
    """Recalcule et persiste les recommandations d'un utilisateur (remplace les anciennes)."""
    results = compute_recommendations_for_user(user)
    Recommendation.objects.filter(user=user).delete()
    Recommendation.objects.bulk_create(
        [
            Recommendation(user=user, movie=movie, score=score, reason=reason)
            for movie, score, reason in results
        ]
    )
    return len(results)
