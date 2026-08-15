import { apiFetch } from "./client";
import { Genre } from "@/lib/types";

export function fetchGenres() {
  return apiFetch<Genre[]>("/genres/", { auth: false });
}
