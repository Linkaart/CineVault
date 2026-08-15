import { apiFetch } from "./client";
import { Compatibility } from "@/lib/types";

export function fetchCompatibility(userId: number) {
  return apiFetch<Compatibility>(`/users/${userId}/compatibility/`);
}
