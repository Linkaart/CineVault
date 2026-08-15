from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .engine import save_recommendations
from .models import Recommendation
from .serializers import RecommendationSerializer


class RecommendationListView(generics.ListAPIView):
    serializer_class = RecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Recommendation.objects.filter(user=self.request.user).select_related("movie")


class RecommendationRefreshView(APIView):
    """Force le recalcul synchrone des recommandations (utile en dev/démo)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        count = save_recommendations(request.user)
        return Response({"recommendations_generated": count})
