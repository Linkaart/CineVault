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
  followers_count: number;
  following_count: number;
  reviews_count: number;
  date_joined: string;
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
