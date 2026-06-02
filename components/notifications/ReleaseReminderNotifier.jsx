"use client";

import { useEffect } from "react";
import { useMovieStore } from "@/stores/movieStore";

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hasReachedReleaseDate(releaseDate) {
  return Boolean(releaseDate) && releaseDate <= todayKey();
}

export default function ReleaseReminderNotifier() {
  const watchlist = useMovieStore((state) => state.watchlist);
  const releaseNotifications = useMovieStore((state) => state.releaseNotifications);
  const markReleaseNotified = useMovieStore((state) => state.markReleaseNotified);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    function notifyReadyReleases() {
      watchlist.forEach((movie) => {
        if (!movie?.id || !hasReachedReleaseDate(movie.release_date)) return;
        if (releaseNotifications[movie.id] === movie.release_date) return;

        const notification = new Notification("Ya está en cines", {
          body: `${movie.title} se estrena hoy. Abre la ficha para ver trailer y detalles.`,
          tag: `release-${movie.id}`,
        });

        notification.onclick = () => {
          window.focus();
          window.location.href = `/peli/${movie.id}`;
        };

        markReleaseNotified(movie.id, movie.release_date);
      });
    }

    notifyReadyReleases();
    const timer = window.setInterval(notifyReadyReleases, 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [markReleaseNotified, releaseNotifications, watchlist]);

  return null;
}
