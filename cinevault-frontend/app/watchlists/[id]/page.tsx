import { notFound } from "next/navigation";
import { fetchWatchlist } from "@/lib/api/watchlists";
import MovieGrid from "@/components/movies/MovieGrid";

export default async function WatchlistDetailPage({ params }: { params: { id: string } }) {
  let list;
  try {
    list = await fetchWatchlist(params.id);
  } catch {
    notFound();
  }

  const movies = list!.entries.map((entry) => entry.movie);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <p className="text-xs text-smoke mb-2">Liste par {list!.owner_username}</p>
      <h1 className="font-display text-4xl tracking-wide text-paper mb-2">{list!.name}</h1>
      {list!.description && <p className="text-paper/70 mb-6 max-w-xl">{list!.description}</p>}
      <MovieGrid movies={movies} />
    </div>
  );
}
