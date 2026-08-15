from rest_framework import permissions, viewsets

from .models import Review
from .permissions import IsOwnerOrReadOnly
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        qs = Review.objects.select_related("user", "movie")
        movie_id = self.request.query_params.get("movie")
        user_id = self.request.query_params.get("user")
        if movie_id:
            qs = qs.filter(movie_id=movie_id)
        if user_id:
            qs = qs.filter(user_id=user_id)
        return qs
