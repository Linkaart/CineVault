from django.urls import path

from .views import FollowToggleView, MeView, RegisterView, UserDetailView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("users/me/", MeView.as_view(), name="user-me"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    path("users/<int:user_id>/follow/", FollowToggleView.as_view(), name="follow-toggle"),
]
