import { apiFetch } from "./client";
import { Movie, Paginated, Review } from "@/lib/types";

export function fetchMovies(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch<Paginated<Movie>>(`/movies/${qs ? `?${qs}` : ""}`, { auth: false });
}

export function fetchMovie(id: number | string) {
  return apiFetch<Movie>(`/movies/${id}/`, { auth: false });
}

export function fetchMovieReviews(movieId: number | string) {
  return apiFetch<Paginated<Review>>(`/reviews/?movie=${movieId}`, { auth: false });
}
