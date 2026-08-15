from apps.reviews.models import Review


def compute_compatibility(user_a, user_b):
    """Calcule un score de compatibilité (0-100) entre deux utilisateurs.

    Se base en priorité sur les films notés par les deux (similarité des
    notes) ; à défaut, retombe sur le recoupement de leurs genres favoris.
    """
    ratings_a = dict(Review.objects.filter(user=user_a).values_list("movie_id", "rating"))
    ratings_b = dict(Review.objects.filter(user=user_b).values_list("movie_id", "rating"))
    common_ids = set(ratings_a) & set(ratings_b)

    if common_ids:
        diffs = [abs(ratings_a[mid] - ratings_b[mid]) for mid in common_ids]
        avg_diff = sum(diffs) / len(diffs)
        score = round(max(0.0, 100 - (avg_diff / 9) * 100), 1)
        return {
            "score": score,
            "basis": "reviews",
            "common_movie_ids": sorted(common_ids, key=lambda mid: -min(ratings_a[mid], ratings_b[mid])),
        }

    genres_a = set(user_a.favorite_genres.values_list("id", flat=True))
    genres_b = set(user_b.favorite_genres.values_list("id", flat=True))
    union = genres_a | genres_b
    score = round((len(genres_a & genres_b) / len(union)) * 100, 1) if union else 0.0
    return {"score": score, "basis": "genres", "common_movie_ids": []}
