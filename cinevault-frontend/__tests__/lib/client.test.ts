import { apiFetch, ApiError, setTokens, clearTokens } from "@/lib/api/client";

describe("ApiError", () => {
  it("utilise le champ 'detail' comme message si présent", () => {
    const error = new ApiError(400, { detail: "Requête invalide." });
    expect(error.message).toBe("Requête invalide.");
    expect(error.status).toBe(400);
  });

  it("concatène les erreurs de validation par champ si pas de 'detail'", () => {
    const error = new ApiError(400, { rating: ["La note doit être entre 1 et 10."] });
    expect(error.message).toBe("La note doit être entre 1 et 10.");
  });

  it("retombe sur un message générique si le corps est vide", () => {
    const error = new ApiError(500, {});
    expect(error.message).toBe("Une erreur est survenue.");
  });
});

describe("apiFetch", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  it("effectue une requête GET simple et retourne le JSON", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 1, title: "Blade Runner" }),
    });

    const data = await apiFetch<{ id: number; title: string }>("/movies/1/", { auth: false });
    expect(data.title).toBe("Blade Runner");
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("ajoute le header Authorization quand un token est présent", async () => {
    setTokens("access-token-123", "refresh-token-456");
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await apiFetch("/users/me/");

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const headers = options.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer access-token-123");
  });

  it("n'ajoute pas de header Authorization quand auth=false", async () => {
    setTokens("access-token-123", "refresh-token-456");
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await apiFetch("/movies/", { auth: false });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const headers = options.headers as Headers;
    expect(headers.get("Authorization")).toBeNull();
  });

  it("lève une ApiError avec le bon statut en cas d'échec", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ detail: "Permission refusée." }),
    });

    await expect(apiFetch("/reviews/1/", { auth: false })).rejects.toMatchObject({
      status: 403,
      message: "Permission refusée.",
    });
  });

  it("tente un refresh du token sur un 401 puis rejoue la requête", async () => {
    setTokens("expired-access", "valid-refresh");

    (global.fetch as jest.Mock)
      // 1ère requête : token expiré
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
      // refresh du token
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ access: "new-access" }) })
      // requête rejouée avec le nouveau token
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ success: true }) });

    const data = await apiFetch<{ success: boolean }>("/users/me/");

    expect(data.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(localStorage.getItem("cinevault_access")).toBe("new-access");
  });

  it("efface les tokens si le refresh échoue lui aussi", async () => {
    setTokens("expired-access", "invalid-refresh");

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });

    await expect(apiFetch("/users/me/")).rejects.toBeInstanceOf(ApiError);
    expect(localStorage.getItem("cinevault_access")).toBeNull();
    expect(localStorage.getItem("cinevault_refresh")).toBeNull();
  });

  it("clearTokens supprime bien les deux tokens", () => {
    setTokens("a", "b");
    clearTokens();
    expect(localStorage.getItem("cinevault_access")).toBeNull();
    expect(localStorage.getItem("cinevault_refresh")).toBeNull();
  });
});
