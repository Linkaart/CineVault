import Link from "next/link";
import Image from "next/image";
import { Movie } from "@/lib/types";
import RatingStars from "@/components/ui/RatingStars";

export default function MovieCard({ movie }: { movie: Movie }) {
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;

  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group relative block rounded-lg overflow-hidden bg-curtain border border-white/5 hover:border-neon/40 transition-all duration-300 hover:shadow-glow focus-ring"
    >
      <div className="relative aspect-[2/3] bg-void">
        {movie.poster_url ? (
          <Image
            src={movie.poster_url}
            alt={movie.title}
            fill
            sizes="(max-width: 768px) 45vw, 220px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-smoke text-xs px-4 text-center">
            {movie.title}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-3">
        <h3 className="font-display text-lg tracking-wide leading-tight text-paper group-hover:text-marquee transition-colors line-clamp-1">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-smoke">{year ?? "—"}</span>
          <RatingStars value={movie.avg_rating} />
        </div>
      </div>
    </Link>
  );
}
