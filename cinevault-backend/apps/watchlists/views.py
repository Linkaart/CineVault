from django.db.models import Q
from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from .models import ListEntry, WatchList
from .serializers import ListEntrySerializer, WatchListSerializer


class IsWatchlistOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return obj.is_public or obj.user == request.user
        return obj.user == request.user


class WatchListViewSet(viewsets.ModelViewSet):
    serializer_class = WatchListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsWatchlistOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        qs = WatchList.objects.select_related("user").prefetch_related("entries__movie")
        if user.is_authenticated:
            return qs.filter(Q(is_public=True) | Q(user=user))
        return qs.filter(is_public=True)


class ListEntryViewSet(viewsets.ModelViewSet):
    serializer_class = ListEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def _get_watchlist(self):
        return WatchList.objects.get(pk=self.kwargs["watchlist_pk"])

    def get_queryset(self):
        return ListEntry.objects.filter(watchlist_id=self.kwargs["watchlist_pk"])

    def perform_create(self, serializer):
        watchlist = self._get_watchlist()
        if watchlist.user != self.request.user:
            raise PermissionDenied("Tu n'es pas propriétaire de cette liste.")
        serializer.save(watchlist=watchlist)

    def perform_destroy(self, instance):
        if instance.watchlist.user != self.request.user:
            raise PermissionDenied("Tu n'es pas propriétaire de cette liste.")
        instance.delete()
