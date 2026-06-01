"use client";

import { useEffect } from "react";
import { useMovieStore } from "@/stores/movieStore";

export default function ViewTracker({ movie }) {
  const markViewed = useMovieStore((state) => state.markViewed);

  useEffect(() => {
    markViewed(movie);
  }, [markViewed, movie]);

  return null;
}
