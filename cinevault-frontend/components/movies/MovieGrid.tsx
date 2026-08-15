import { Movie } from "@/lib/types";
import MovieCard from "./MovieCard";

export default function MovieGrid({ movies }: { movies: Movie[] }) {
  if (movies.length === 0) {
    return (
      <div className="text-center py-20 text-smoke">
        <p className="font-display text-2xl text-paper/60 mb-2">Salle vide</p>
        <p className="text-sm">Aucun film ne correspond à ta recherche.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
