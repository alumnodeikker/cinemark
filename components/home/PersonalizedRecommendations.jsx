"use client";

import { useEffect, useMemo, useState } from "react";
import MovieCard from "@/components/movie/MovieCard";
import { useMovieStore } from "@/stores/movieStore";

function compactMovie(movie) {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    vote_average: movie.vote_average,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date,
    genre_ids: movie.genre_ids ?? [],
  };
}

export default function PersonalizedRecommendations() {
  const favorites = useMovieStore((state) => state.favorites);
  const watchlist = useMovieStore((state) => state.watchlist);
  const viewedHistory = useMovieStore((state) => state.viewedHistory);
  const [recommendations, setRecommendations] = useState([]);
  const [status, setStatus] = useState("idle");

  const profile = useMemo(
    () => ({
      favorites: favorites.slice(0, 20).map(compactMovie),
      watchlist: watchlist.slice(0, 20).map(compactMovie),
      viewedHistory: viewedHistory.slice(0, 20).map(compactMovie),
    }),
    [favorites, watchlist, viewedHistory]
  );

  const signalCount = profile.favorites.length + profile.watchlist.length + profile.viewedHistory.length;

  useEffect(() => {
    if (signalCount === 0) {
      setRecommendations([]);
      setStatus("idle");
      return;
    }

    const controller = new AbortController();

    async function loadRecommendations() {
      setStatus("loading");
      try {
        const response = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("No se pudieron cargar recomendaciones");

        const data = await response.json();
        setRecommendations(Array.isArray(data?.recommendations) ? data.recommendations : []);
        setStatus("ready");
      } catch (error) {
        if (error.name !== "AbortError") {
          setRecommendations([]);
          setStatus("error");
        }
      }
    }

    loadRecommendations();

    return () => controller.abort();
  }, [profile, signalCount]);

  if (signalCount === 0) {
    return (
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">
              Seleccion personalizada
            </p>
            <h2 className="text-3xl font-black uppercase tracking-wide text-white">
              Recomendado para ti
            </h2>
          </div>
        </div>
        <div className="rounded-sm border border-white/10 bg-white/6 p-6 text-sm text-white/72">
          Agrega peliculas a favoritos o abre algunas fichas para que el sistema aprenda tus gustos.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">
            Seleccion personalizada
          </p>
          <h2 className="text-3xl font-black uppercase tracking-wide text-white">
            Recomendado para ti
          </h2>
        </div>
        <p className="max-w-md text-sm text-white/60">
          Basado en tus favoritos, historial y peliculas guardadas.
        </p>
      </div>

      {status === "loading" && (
        <div className="poster-rail">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[300px] w-[175px] shrink-0 animate-pulse rounded-sm bg-white/8 sm:w-[205px]"
            />
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="rounded-sm border border-red-400/25 bg-red-500/10 p-5 text-sm text-red-100">
          No se pudieron cargar tus recomendaciones ahora mismo.
        </div>
      )}

      {status === "ready" && recommendations.length > 0 && (
        <div className="poster-rail">
          {recommendations.map((peli) => (
            <div key={peli.id} className="space-y-2">
              <MovieCard
                id={peli.id}
                titulo={peli.title}
                descripcion={peli.overview}
                rating={peli.vote_average}
                imagenPath={peli.poster_path}
                backdropPath={peli.backdrop_path}
                pelicula={peli}
                modo="rail"
                showActions={false}
              />
              <p className="w-[175px] text-xs leading-5 text-white/58 sm:w-[205px]">
                {peli.reason}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
