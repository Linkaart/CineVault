from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Follow
from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


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
