from rest_framework.routers import DefaultRouter

from .views import GenreViewSet, MovieViewSet

router = DefaultRouter()
router.register("movies", MovieViewSet, basename="movie")
router.register("genres", GenreViewSet, basename="genre")

urlpatterns = router.urls
