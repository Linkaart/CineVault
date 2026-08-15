from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),
    path("api/", include("apps.movies.urls")),
    path("api/", include("apps.reviews.urls")),
    path("api/", include("apps.watchlists.urls")),
    path("api/", include("apps.recommendations.urls")),
    path("api/", include("apps.users.urls")),
    path("api/auth/token/", include("apps.users.token_urls")),
]
