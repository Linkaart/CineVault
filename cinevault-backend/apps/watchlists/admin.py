from django.contrib import admin
from .models import ListEntry, WatchList


class ListEntryInline(admin.TabularInline):
    model = ListEntry
    extra = 0


@admin.register(WatchList)
class WatchListAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "user", "is_public", "created_at")
    inlines = [ListEntryInline]
