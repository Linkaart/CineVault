"use client";

import { useState } from "react";
import { Review } from "@/lib/types";
import { fetchMovieReviews } from "@/lib/api/movies";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";

export default function ReviewSection({
  movieId,
  initialReviews,
}: {
  movieId: number;
  initialReviews: Review[];
}) {
  const [reviews, setReviews] = useState(initialReviews);

  async function refresh() {
    const data = await fetchMovieReviews(movieId);
    setReviews(data.results);
  }

  return (
    <div className="space-y-6">
      <ReviewForm movieId={movieId} onSuccess={refresh} />
      <ReviewList reviews={reviews} />
    </div>
  );
}
