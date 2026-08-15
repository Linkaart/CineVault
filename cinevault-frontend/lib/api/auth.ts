import { apiFetch } from "./client";
import { AuthTokens, User } from "@/lib/types";

export function login(username: string, password: string) {
  return apiFetch<AuthTokens>("/auth/token/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    auth: false,
  });
}

export function register(data: { username: string; email: string; password: string }) {
  return apiFetch<User>("/auth/register/", {
    method: "POST",
    body: JSON.stringify(data),
    auth: false,
  });
}

export function fetchMe() {
  return apiFetch<User>("/users/me/");
}

export function updateProfile(data: {
  bio?: string;
  favorite_genres?: number[];
  avatarFile?: File | null;
}) {
  const { avatarFile, ...rest } = data;

  if (avatarFile) {
    const form = new FormData();
    if (rest.bio !== undefined) form.append("bio", rest.bio);
    if (rest.favorite_genres !== undefined) {
      rest.favorite_genres.forEach((id) => form.append("favorite_genres", String(id)));
    }
    form.append("avatar", avatarFile);
    return apiFetch<User>("/users/me/", { method: "PATCH", body: form });
  }

  return apiFetch<User>("/users/me/", {
    method: "PATCH",
    body: JSON.stringify(rest),
  });
}
