"use client";

import { useState } from "react";
import { createReview } from "@/lib/api/reviews";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";

export default function ReviewForm({
  movieId,
  onSuccess,
}: {
  movieId: number;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState(7);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <p className="text-sm text-smoke border border-white/10 rounded-lg p-4">
        Connecte-toi pour publier une critique.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createReview({ movie: movieId, rating, content });
      setContent("");
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de l'envoi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-white/10 rounded-lg p-4 space-y-3 bg-curtain/50">
      <div>
        <label className="text-xs tracking-wide text-smoke block mb-2">
          Ta note : <span className="text-marquee font-semibold">{rating}/10</span>
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full accent-neon"
        />
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Qu'as-tu pensé de ce film ?"
        rows={3}
        className="w-full bg-void border border-white/10 rounded-md p-3 text-sm text-paper placeholder:text-smoke focus-ring resize-none"
      />
      {error && <p className="text-neon text-xs">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 rounded-full bg-marquee text-void text-sm font-semibold shadow-gold hover:brightness-110 transition disabled:opacity-50 focus-ring"
      >
        {submitting ? "Envoi..." : "Publier la critique"}
      </button>
    </form>
  );
}
