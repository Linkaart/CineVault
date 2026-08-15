"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      router.push("/movies");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Identifiants incorrects.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <p className="font-display tracking-[0.3em] text-neon text-glow-neon text-xs text-center mb-3">
        SÉANCE PRIVÉE
      </p>
      <h1 className="font-display text-4xl tracking-wide text-paper text-center mb-8">
        Connexion
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-smoke block mb-1">Nom d&apos;utilisateur</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-curtain border border-white/10 rounded-md px-3 py-2 text-sm text-paper focus-ring"
          />
        </div>
        <div>
          <label className="text-xs text-smoke block mb-1">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-curtain border border-white/10 rounded-md px-3 py-2 text-sm text-paper focus-ring"
          />
        </div>
        {error && <p className="text-neon text-xs">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-full bg-neon text-void font-semibold shadow-glow hover:brightness-110 transition disabled:opacity-50 focus-ring"
        >
          {submitting ? "Connexion..." : "Se connecter"}
        </button>
      </form>
      <p className="text-center text-sm text-smoke mt-6">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-marquee hover:underline focus-ring">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
