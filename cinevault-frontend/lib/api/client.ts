const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cinevault_access");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cinevault_refresh");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("cinevault_access", access);
  localStorage.setItem("cinevault_refresh", refresh);
}

export function clearTokens() {
  localStorage.removeItem("cinevault_access");
  localStorage.removeItem("cinevault_refresh");
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  const res = await fetch(`${API_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    clearTokens();
    return null;
  }
  const data = await res.json();
  localStorage.setItem("cinevault_access", data.access);
  return data.access;
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const finalHeaders = new Headers(headers);
  if (!(rest.body instanceof FormData)) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(`${API_URL}${path}`, { ...rest, headers: finalHeaders });

  if (res.status === 401 && auth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      finalHeaders.set("Authorization", `Bearer ${newToken}`);
      res = await fetch(`${API_URL}${path}`, { ...rest, headers: finalHeaders });
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(res.status, errorBody);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export class ApiError extends Error {
  status: number;
  body: Record<string, unknown>;

  constructor(status: number, body: Record<string, unknown>) {
    const message =
      typeof body?.detail === "string"
        ? body.detail
        : Object.values(body).flat().join(" ") || "Une erreur est survenue.";
    super(message);
    this.status = status;
    this.body = body;
  }
}
