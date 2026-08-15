import { apiFetch } from "./client";
import { Paginated, Recommendation } from "@/lib/types";

export function fetchRecommendations() {
  return apiFetch<Paginated<Recommendation>>("/recommendations/");
}

export function refreshRecommendations() {
  return apiFetch<{ recommendations_generated: number }>("/recommendations/refresh/", {
    method: "POST",
  });
}
