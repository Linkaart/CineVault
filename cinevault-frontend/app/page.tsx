import Link from "next/link";
import { fetchMovies } from "@/lib/api/movies";
import MovieGrid from "@/components/movies/MovieGrid";

export default async function HomePage() {
  let movies: Awaited<ReturnType<typeof fetchMovies>>["results"] = [];
  try {
    const data = await fetchMovies({ ordering: "-avg_rating" });
    movies = data.results.slice(0, 10);
  } catch {
    movies = [];
  }

  return (
    <div>
      <section className="relative border-b border-white/10 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <p className="font-display tracking-[0.3em] text-neon text-glow-neon text-sm mb-4">
            LES LUMIÈRES S&apos;ÉTEIGNENT
          </p>
          <h1 className="font-display text-5xl sm:text-7xl tracking-wide text-paper leading-none mb-6">
            Chaque film mérite
            <br />
            <span className="text-marquee text-glow-gold">sa critique</span>
          </h1>
          <p className="text-paper/60 max-w-xl mx-auto mb-8">
            Note, commente et construis tes listes. Plus tu critiques, plus CineVault
            affine ce qu&apos;il te propose ensuite.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/movies"
              className="px-6 py-3 rounded-full bg-neon text-void font-semibold shadow-glow hover:brightness-110 transition focus-ring"
            >
              Entrer dans la salle
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 rounded-full border border-marquee/40 text-marquee hover:bg-marquee/10 transition focus-ring"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-2xl tracking-wide text-paper">À l&apos;affiche</h2>
          <Link href="/movies" className="text-sm text-smoke hover:text-marquee transition-colors focus-ring">
            Voir tout le catalogue →
          </Link>
        </div>
        <MovieGrid movies={movies} />
      </section>
    </div>
  );
}
