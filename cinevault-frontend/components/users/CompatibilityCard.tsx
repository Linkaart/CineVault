"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchCompatibility } from "@/lib/api/users";
import { Compatibility } from "@/lib/types";
import MovieCard from "@/components/movies/MovieCard";

export default function CompatibilityCard({ userId }: { userId: number }) {
  const { user } = useAuth();
  const [data, setData] = useState<Compatibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.id === userId) return;
    setLoading(true);
    setError(null);
    fetchCompatibility(userId)
      .then(setData)
      .catch(() => setError("Impossible de calculer la compatibilité."))
      .finally(() => setLoading(false));
  }, [user, userId]);

  if (!user || user.id === userId) return null;
  if (loading) return <p className="text-smoke text-sm mt-8">Calcul de la compatibilité...</p>;
  if (error) return <p className="text-red-400 text-sm mt-8">{error}</p>;
  if (!data) return null;

  const color = data.score >= 70 ? "text-neon" : data.score >= 40 ? "text-marquee" : "text-smoke";
  const plural = data.common_movies_count > 1 ? "s" : "";

  return (
    <div className="mt-8 max-w-3xl mx-auto text-left">
      <div className="rounded-2xl border border-white/10 bg-curtain p-6 text-center">
        <p className="font-display tracking-[0.3em] text-neon text-glow-neon text-xs mb-2">
          COMPATIBILITÉ CINÉ
        </p>
        <p className={`font-display text-5xl ${color}`}>{data.score}%</p>
        <p className="text-smoke text-sm mt-2">
          {data.basis === "reviews"
            ? `Basé sur ${data.common_movies_count} film${plural} noté${plural} en commun avec ${data.user.username}`
            : `Basé sur vos genres favoris (aucun film noté en commun avec ${data.user.username} pour l'instant)`}
        </p>
      </div>

      {data.common_movies.length > 0 && (
        <div className="mt-6">
          <h2 className="font-display text-xl text-paper mb-4">Films en commun</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {data.common_movies.map(({ movie, your_rating, their_rating }) => (
              <div key={movie.id}>
                <MovieCard movie={movie} />
                <p className="text-xs text-reel mt-1 px-1">
                  Toi : {your_rating}/10 · {data.user.username} : {their_rating}/10
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
