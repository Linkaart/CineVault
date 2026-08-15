import { fetchMovies } from "@/lib/api/movies";
import MovieGrid from "@/components/movies/MovieGrid";
import SearchBar from "@/components/movies/SearchBar";
import Pagination from "@/components/movies/Pagination";

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: { search?: string; ordering?: string; page?: string };
}) {
  const params: Record<string, string> = {};
  if (searchParams.search) params.search = searchParams.search;
  params.ordering = searchParams.ordering || "-avg_rating";
  const currentPage = Math.max(1, Number(searchParams.page) || 1);
  if (currentPage > 1) params.page = String(currentPage);

  let movies: Awaited<ReturnType<typeof fetchMovies>>["results"] = [];
  let count = 0;
  try {
    const data = await fetchMovies(params);
    movies = data.results;
    count = data.count;
  } catch {
    movies = [];
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-wide text-paper mb-2">Catalogue</h1>
        <p className="text-smoke text-sm">{count} film{count > 1 ? "s" : ""} au programme</p>
      </div>
      <SearchBar defaultValue={searchParams.search} />
      <div className="mt-8">
        <MovieGrid movies={movies} />
      </div>
      <Pagination count={count} currentPage={currentPage} />
    </div>
  );
}
