import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchMovie, fetchMovieReviews } from "@/lib/api/movies";
import RatingStars from "@/components/ui/RatingStars";
import ReviewSection from "@/components/reviews/ReviewSection";

export default async function MovieDetailPage({ params }: { params: { id: string } }) {
  let movie;
  try {
    movie = await fetchMovie(params.id);
  } catch {
    notFound();
  }
  const reviewsData = await fetchMovieReviews(params.id).catch(() => ({ results: [], count: 0 }));

  const year = movie!.release_date ? new Date(movie!.release_date).getFullYear() : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-[280px_1fr] gap-8">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-curtain border border-white/5 shadow-glow">
          {movie!.poster_url ? (
            <Image src={movie!.poster_url} alt={movie!.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-smoke text-sm px-4 text-center">
              {movie!.title}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide text-paper leading-tight mb-2">
            {movie!.title}
          </h1>
          <div className="flex items-center gap-4 text-smoke text-sm mb-4">
            {year && <span>{year}</span>}
            {movie!.runtime ? <span>{movie!.runtime} min</span> : null}
            {movie!.director && <span>Réal. {movie!.director}</span>}
          </div>
          <RatingStars value={movie!.avg_rating} size="lg" />

          <div className="flex flex-wrap gap-2 mt-4">
            {movie!.genres.map((g) => (
              <span
                key={g.id}
                className="text-xs px-3 py-1 rounded-full border border-reel/30 text-reel"
              >
                {g.name}
              </span>
            ))}
          </div>

          {movie!.overview && (
            <p className="text-paper/75 leading-relaxed mt-6 max-w-2xl">{movie!.overview}</p>
          )}
        </div>
      </div>

      <div className="mt-14 max-w-2xl">
        <h2 className="font-display text-2xl tracking-wide text-paper mb-4">
          Critiques ({reviewsData.count ?? reviewsData.results.length})
        </h2>
        <ReviewSection movieId={movie!.id} initialReviews={reviewsData.results} />
      </div>
    </div>
  );
}
