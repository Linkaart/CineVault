from django.conf import settings
from django.db import models


class WatchList(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="watchlists"
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.user})"


class ListEntry(models.Model):
    watchlist = models.ForeignKey(
        WatchList, on_delete=models.CASCADE, related_name="entries"
    )
    movie = models.ForeignKey("movies.Movie", on_delete=models.CASCADE)
    position = models.PositiveIntegerField(default=0)
    note = models.CharField(max_length=255, blank=True)

    class Meta:
        unique_together = ("watchlist", "movie")
        ordering = ["position"]
