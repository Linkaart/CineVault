import { Review } from "@/lib/types";

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-smoke">Aucune critique pour l&apos;instant. Sois le premier.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article key={review.id} className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-marquee">{review.user_username}</span>
            <span className="text-xs text-reel font-mono">{review.rating}/10</span>
          </div>
          {review.content && <p className="text-sm text-paper/80 leading-relaxed">{review.content}</p>}
          <time className="text-xs text-smoke mt-1 block">
            {new Date(review.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </article>
      ))}
    </div>
  );
}
