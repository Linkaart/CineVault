from django.db import models


class Genre(models.Model):
    tmdb_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Movie(models.Model):
    tmdb_id = models.IntegerField(unique=True)
    title = models.CharField(max_length=255)
    overview = models.TextField(blank=True)
    release_date = models.DateField(null=True, blank=True)
    poster_url = models.URLField(blank=True)
    runtime = models.IntegerField(null=True, blank=True)
    director = models.CharField(max_length=255, blank=True)
    vote_average_tmdb = models.FloatField(default=0)
    genres = models.ManyToManyField(Genre, related_name="movies", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
