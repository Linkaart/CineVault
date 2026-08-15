from django.contrib import admin
from .models import Recommendation


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "movie", "score", "reason")
    list_filter = ("reason",)
