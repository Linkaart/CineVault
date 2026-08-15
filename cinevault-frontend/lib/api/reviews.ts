import { apiFetch } from "./client";
import { Review } from "@/lib/types";

export function createReview(data: { movie: number; rating: number; content: string }) {
  return apiFetch<Review>("/reviews/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateReview(id: number, data: Partial<{ rating: number; content: string }>) {
  return apiFetch<Review>(`/reviews/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteReview(id: number) {
  return apiFetch<void>(`/reviews/${id}/`, { method: "DELETE" });
}
