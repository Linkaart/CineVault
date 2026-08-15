import { apiFetch } from "./client";
import { Paginated, WatchList } from "@/lib/types";

export function fetchWatchlists(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch<Paginated<WatchList>>(`/watchlists/${qs ? `?${qs}` : ""}`);
}

export function fetchWatchlist(id: number | string) {
  return apiFetch<WatchList>(`/watchlists/${id}/`);
}

export function createWatchlist(data: { name: string; description?: string; is_public: boolean }) {
  return apiFetch<WatchList>("/watchlists/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function addMovieToWatchlist(watchlistId: number, movieId: number, position = 0) {
  return apiFetch(`/watchlists/${watchlistId}/movies/`, {
    method: "POST",
    body: JSON.stringify({ movie_id: movieId, position }),
  });
}
