from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.movies.models import Movie
from apps.movies.serializers import MovieListSerializer
from apps.reviews.models import Review

from .compatibility import compute_compatibility
from .models import Follow
from .serializers import RegisterSerializer, UserSerializer
from .throttling import AuthRateThrottle

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class FollowToggleView(APIView):
    """POST : suit l'utilisateur si pas encore suivi, sinon annule le suivi."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        if user_id == request.user.id:
            return Response(
                {"detail": "Impossible de se suivre soi-même."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        target = get_object_or_404(User, pk=user_id)
        follow, created = Follow.objects.get_or_create(
            follower=request.user, following=target
        )
        if not created:
            follow.delete()
            return Response({"following": False}, status=status.HTTP_200_OK)
        return Response({"following": True}, status=status.HTTP_201_CREATED)


class CompatibilityView(APIView):
    """Score de compatibilité ciné entre l'utilisateur connecté et un autre."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        other = get_object_or_404(User, pk=user_id)
        if other == request.user:
            return Response(
                {"detail": "Impossible de calculer une compatibilité avec soi-même."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = compute_compatibility(request.user, other)

        common_movies = []
        if result["common_movie_ids"]:
            ratings_mine = dict(
                Review.objects.filter(
                    user=request.user, movie_id__in=result["common_movie_ids"]
                ).values_list("movie_id", "rating")
            )
            ratings_theirs = dict(
                Review.objects.filter(
                    user=other, movie_id__in=result["common_movie_ids"]
                ).values_list("movie_id", "rating")
            )
            movies_by_id = {
                m.id: m
                for m in Movie.objects.filter(
                    id__in=result["common_movie_ids"][:10]
                ).prefetch_related("genres")
            }
            for movie_id in result["common_movie_ids"][:10]:
                movie = movies_by_id.get(movie_id)
                if not movie:
                    continue
                common_movies.append(
                    {
                        "movie": MovieListSerializer(movie).data,
                        "your_rating": ratings_mine.get(movie_id),
                        "their_rating": ratings_theirs.get(movie_id),
                    }
                )

        return Response(
            {
                "user": UserSerializer(other).data,
                "score": result["score"],
                "basis": result["basis"],
                "common_movies_count": len(result["common_movie_ids"]),
                "common_movies": common_movies,
            }
        )
