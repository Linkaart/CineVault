from django.urls import path

from .views import RecommendationListView, RecommendationRefreshView

urlpatterns = [
    path("recommendations/", RecommendationListView.as_view(), name="recommendations"),
    path("recommendations/refresh/", RecommendationRefreshView.as_view(), name="recommendations-refresh"),
]
