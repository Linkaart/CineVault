export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  tmdb_id: number;
  title: string;
  overview?: string;
  release_date: string | null;
  poster_url: string;
  runtime?: number;
  director?: string;
  genres: Genre[];
  avg_rating: number | null;
  review_count?: number;
}

export interface User {
  id: number;
  username: string;
  bio: string;
  avatar: string | null;
  favorite_genres: number[];
  favorite_genres_detail: Genre[];
  top_genres: Genre[];
  followers_count: number;
  following_count: number;
  reviews_count: number;
  date_joined: string;
}

export interface CompatibilityMovie {
  movie: Movie;
  your_rating: number | null;
  their_rating: number | null;
}

export interface Compatibility {
  user: User;
  score: number;
  basis: "reviews" | "genres";
  common_movies_count: number;
  common_movies: CompatibilityMovie[];
}

export interface Review {
  id: number;
  movie: number;
  movie_title: string;
  user: number;
  user_username: string;
  rating: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ListEntry {
  id: number;
  movie: Movie;
  position: number;
  note: string;
}

export interface WatchList {
  id: number;
  user: number;
  owner_username: string;
  name: string;
  description: string;
  is_public: boolean;
  entries: ListEntry[];
  movie_count: number;
  created_at: string;
}

export interface Recommendation {
  id: number;
  movie: Movie;
  score: number;
  reason: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
