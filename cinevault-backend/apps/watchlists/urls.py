from rest_framework_nested import routers as nested_routers
from rest_framework.routers import DefaultRouter

from .views import ListEntryViewSet, WatchListViewSet

router = DefaultRouter()
router.register("watchlists", WatchListViewSet, basename="watchlist")

watchlist_router = nested_routers.NestedDefaultRouter(router, "watchlists", lookup="watchlist")
watchlist_router.register("movies", ListEntryViewSet, basename="watchlist-entries")

urlpatterns = router.urls + watchlist_router.urls
