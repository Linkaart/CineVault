from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .throttling import AuthRateThrottle


class ThrottledTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [AuthRateThrottle]


class ThrottledTokenRefreshView(TokenRefreshView):
    throttle_classes = [AuthRateThrottle]


urlpatterns = [
    path("", ThrottledTokenObtainPairView.as_view(), name="token-obtain-pair"),
    path("refresh/", ThrottledTokenRefreshView.as_view(), name="token-refresh"),
]
