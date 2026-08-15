"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { fetchRecommendations, refreshRecommendations } from "@/lib/api/recommendations";
import { Recommendation } from "@/lib/types";
import MovieCard from "@/components/movies/MovieCard";

export default function RecommendationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [busy, setBusy] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      fetchRecommendations()
        .then((data) => setRecs(data.results))
        .finally(() => setFetched(true));
    }
  }, [user]);

  async function handleRefresh() {
    setBusy(true);
    try {
      await refreshRecommendations();
      const data = await fetchRecommendations();
      setRecs(data.results);
    } finally {
      setBusy(false);
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-display tracking-[0.3em] text-neon text-glow-neon text-xs mb-2">
            PROJECTION PRIVÉE
          </p>
          <h1 className="font-display text-4xl tracking-wide text-paper">Pour toi</h1>
        </div>
        <button
          onClick={handleRefresh}
          disabled={busy}
          className="text-sm px-4 py-2 rounded-full border border-marquee/40 text-marquee hover:bg-marquee/10 transition disabled:opacity-50 focus-ring"
        >
          {busy ? "Recalcul..." : "Actualiser"}
        </button>
      </div>

      {fetched && recs.length === 0 && (
        <p className="text-smoke text-sm">
          Note au moins un film pour commencer à recevoir des recommandations.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {recs.map((rec) => (
          <div key={rec.id}>
            <MovieCard movie={rec.movie} />
            <p className="text-xs text-reel mt-1 px-1">{rec.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
