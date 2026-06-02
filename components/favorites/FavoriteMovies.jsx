"use client";

import { useEffect, useMemo, useState } from "react";
import { useMovieStore } from "@/stores/movieStore";
import MovieCard from "@/components/movie/MovieCard";

export default function FavoriteMovies() {
  const favoritas = useMovieStore((state) => state.favorites);
  const [trailerKeys, setTrailerKeys] = useState({});
  const favoriteIds = useMemo(
    () => favoritas.map((peli) => peli.id).filter(Boolean).join(","),
    [favoritas]
  );

  useEffect(() => {
    if (!favoriteIds) {
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    async function loadTrailerKeys() {
      const entries = await Promise.all(
        favoritas.map(async (peli) => {
          if (peli.trailer_key) return [peli.id, peli.trailer_key];

          try {
            const response = await fetch(`/api/trailer/${peli.id}`, {
              signal: controller.signal,
            });
            const data = response.ok ? await response.json() : { key: null };
            return [peli.id, data?.key ?? null];
          } catch (error) {
            if (error.name === "AbortError") return null;
            return [peli.id, null];
          }
        })
      );

      if (!cancelled) {
        setTrailerKeys(Object.fromEntries(entries.filter(Boolean)));
      }
    }

    loadTrailerKeys();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [favoritas, favoriteIds]);

  return (
    <section className="space-y-6">
      <div className="movie-grid">
        {favoritas.length === 0 ? (
          <div className="netflix-panel col-span-full p-8 text-center">
            <p className="text-lg font-semibold uppercase text-white">Tu lista esta vacia</p>
            <p className="mt-2 text-sm text-white/70">
              Agrega peliculas con el corazon para verlas aqui.
            </p>
          </div>
        ) : (
          favoritas.map((peli) => (
            <div key={peli.id} className="fade-up">
              <MovieCard
                id={peli.id}
                titulo={peli.title}
                descripcion={peli.overview}
                rating={peli.vote_average}
                imagenPath={peli.poster_path}
                backdropPath={peli.backdrop_path}
                trailerKey={trailerKeys[peli.id] ?? peli.trailer_key}
                pelicula={peli}
                modo="grid"
                showActions={false}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
