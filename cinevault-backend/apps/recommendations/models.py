from django.conf import settings
from django.db import models


class Recommendation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="recommendations"
    )
    movie = models.ForeignKey("movies.Movie", on_delete=models.CASCADE)
    score = models.FloatField()
    reason = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-score"]
        unique_together = ("user", "movie")

    def __str__(self):
        return f"{self.movie} -> {self.user} ({self.score:.2f})"
