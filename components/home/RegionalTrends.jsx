"use client";

import { useEffect, useMemo, useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import MovieCard from "@/components/movie/MovieCard";

export default function RegionalTrends() {
  const { location, loading: locationLoading } = useGeolocation();
  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState("loading");
  const countryCode = location?.countryCode || "ES";
  const regionLabel = useMemo(() => {
    return location?.countryName || countryCode;
  }, [countryCode, location?.countryName]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTrends() {
      setStatus("loading");
      try {
        const response = await fetch(`/api/trending?countryCode=${encodeURIComponent(countryCode)}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("No se pudieron cargar tendencias");

        const data = await response.json();
        setMovies(Array.isArray(data?.movies) ? data.movies : []);
        setStatus("ready");
      } catch (error) {
        if (error.name !== "AbortError") {
          setMovies([]);
          setStatus("error");
        }
      }
    }

    loadTrends();

    return () => controller.abort();
  }, [countryCode]);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-wide text-white">
            Tendencias
          </h2>
          <p className="mt-1 text-sm text-white/62">
            {locationLoading ? "Detectando region..." : `Segun tu region: ${regionLabel}`}
          </p>
        </div>
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
          No se pudieron cargar las tendencias de tu region.
        </div>
      )}

      {status === "ready" && movies.length > 0 && (
        <div className="poster-rail">
          {movies.map((peli) => (
            <MovieCard
              key={peli.id}
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
          ))}
        </div>
      )}

      {status === "ready" && movies.length === 0 && (
        <div className="rounded-sm border border-white/10 bg-white/6 p-5 text-sm text-white/70">
          No hay tendencias disponibles para esta region ahora mismo.
        </div>
      )}
    </section>
  );
}
