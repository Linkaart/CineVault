import Link from "next/link";
import { apiFetch } from "@/lib/api/client";
import { Paginated, Review } from "@/lib/types";

export default async function FeedPage() {
  let reviews: Review[] = [];
  try {
    const data = await apiFetch<Paginated<Review>>("/reviews/", { auth: false });
    reviews = data.results;
  } catch {
    reviews = [];
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <p className="font-display tracking-[0.3em] text-neon text-glow-neon text-xs mb-2">
        EN CONTINU
      </p>
      <h1 className="font-display text-4xl tracking-wide text-paper mb-8">Fil d&apos;activité</h1>

      <div className="space-y-5">
        {reviews.map((review) => (
          <article key={review.id} className="border-b border-white/5 pb-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm">
                <Link href={`/users/${review.user}`} className="text-marquee hover:underline focus-ring">
                  {review.user_username}
                </Link>{" "}
                <span className="text-paper/60">a noté</span>{" "}
                <Link href={`/movies/${review.movie}`} className="text-paper hover:text-neon transition-colors focus-ring">
                  {review.movie_title}
                </Link>
              </p>
              <span className="text-xs text-reel font-mono shrink-0 ml-2">{review.rating}/10</span>
            </div>
            {review.content && <p className="text-sm text-paper/70 leading-relaxed">{review.content}</p>}
            <time className="text-xs text-smoke mt-1 block">
              {new Date(review.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
              })}
            </time>
          </article>
        ))}
        {reviews.length === 0 && <p className="text-smoke text-sm">Aucune activité pour l&apos;instant.</p>}
      </div>
    </div>
  );
}
