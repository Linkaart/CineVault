import { render, screen } from "@testing-library/react";
import MovieCard from "@/components/movies/MovieCard";
import { Movie } from "@/lib/types";

const baseMovie: Movie = {
  id: 1,
  tmdb_id: 100,
  title: "Blade Runner",
  release_date: "1982-06-25",
  poster_url: "https://image.tmdb.org/t/p/w500/poster.jpg",
  genres: [{ id: 1, name: "Science-Fiction" }],
  avg_rating: 8.6,
};

describe("MovieCard", () => {
  it("affiche le titre du film", () => {
    render(<MovieCard movie={baseMovie} />);
    expect(screen.getByText("Blade Runner")).toBeInTheDocument();
  });

  it("affiche l'année extraite de la date de sortie", () => {
    render(<MovieCard movie={baseMovie} />);
    expect(screen.getByText("1982")).toBeInTheDocument();
  });

  it("affiche un tiret quand il n'y a pas de date de sortie", () => {
    render(<MovieCard movie={{ ...baseMovie, release_date: null }} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("pointe vers la page de détail du film", () => {
    render(<MovieCard movie={baseMovie} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/movies/1");
  });

  it("affiche le titre en repli quand il n'y a pas d'affiche", () => {
    render(<MovieCard movie={{ ...baseMovie, poster_url: "" }} />);
    // Le titre apparaît deux fois : une fois en repli d'affiche, une fois sous la carte
    const occurrences = screen.getAllByText("Blade Runner");
    expect(occurrences.length).toBeGreaterThanOrEqual(2);
  });
});
