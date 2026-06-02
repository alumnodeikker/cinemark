"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Check, Play, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMovieStore } from "@/stores/movieStore";
import ImagePlaceholder from "@/components/movie/ImagePlaceholder";

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

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeSlotLabel(hour) {
  if (hour >= 5 && hour < 12) return "mañana";
  if (hour >= 12 && hour < 19) return "tarde";
  if (hour >= 19 && hour < 24) return "noche";
  return "madrugada";
}

function formatToday(date) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export default function WatchTodayRecommendation() {
  const favorites = useMovieStore((state) => state.favorites);
  const watchlist = useMovieStore((state) => state.watchlist);
  const viewedHistory = useMovieStore((state) => state.viewedHistory);
  const markViewed = useMovieStore((state) => state.markViewed);
  const [now, setNow] = useState(null);
  const [movie, setMovie] = useState(null);
  const [status, setStatus] = useState("loading");
  const [variant, setVariant] = useState(0);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 15 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const context = useMemo(() => {
    if (!now) return null;
    return {
      hour: now.getHours(),
      day: now.getDay(),
      date: localDateKey(now),
      variant,
    };
  }, [now, variant]);

  const profile = useMemo(
    () => ({
      favorites: favorites.slice(0, 20).map(compactMovie),
      watchlist: watchlist.slice(0, 20).map(compactMovie),
      viewedHistory: viewedHistory.slice(0, 20).map(compactMovie),
    }),
    [favorites, watchlist, viewedHistory]
  );

  useEffect(() => {
    if (!context) return;

    const controller = new AbortController();

    async function loadMovie() {
      setStatus("loading");
      try {
        const response = await fetch("/api/watch-today", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...profile, context }),
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("No se pudo elegir una pelicula");

        const data = await response.json();
        setMovie(data?.movie ?? null);
        setStatus(data?.movie ? "ready" : "empty");
      } catch (error) {
        if (error.name !== "AbortError") {
          setMovie(null);
          setStatus("error");
        }
      }
    }

    loadMovie();

    return () => controller.abort();
  }, [context, profile]);

  const dayLabel = now ? formatToday(now) : "hoy";
  const slotLabel = now ? timeSlotLabel(now.getHours()) : "hoy";
  const backdropUrl = movie?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;
  const posterUrl = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;
  const year = movie?.release_date?.split("-")?.[0] ?? "N/D";
  const rating = movie?.vote_average ? Number(movie.vote_average).toFixed(1) : "N/D";
  const isViewed = movie?.id
    ? viewedHistory.some((item) => Number(item.id) === Number(movie.id))
    : false;

  function handleMarkViewed() {
    if (!movie) return;
    markViewed(movie);
  }

  function handleRotateMovie() {
    setVariant((current) => (current + 1) % 51);
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
            {dayLabel}
          </p>
          <h2 className="text-3xl font-black uppercase tracking-wide text-white">
            Que ver hoy
          </h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-sm border border-white/15 bg-white/8 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/75">
          <CalendarDays className="h-4 w-4 text-amber-300" />
          {slotLabel}
        </div>
      </div>

      <article className="relative min-h-[360px] overflow-hidden rounded-sm border border-white/10 bg-zinc-950">
        {status === "loading" && (
          <div className="absolute inset-0 animate-pulse bg-white/8" />
        )}

        {status === "ready" && movie && (
          <>
            {backdropUrl ? (
              <Image
                src={backdropUrl}
                alt={movie.title}
                fill
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <ImagePlaceholder title={movie.title} label="Fondo no disponible" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />

            <div className="relative z-10 grid min-h-[360px] gap-5 p-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:p-6 lg:p-8">
              <Link
                href={`/peli/${movie.id}`}
                className="relative hidden aspect-[2/3] overflow-hidden rounded-sm border border-white/15 bg-black/40 shadow-[0_24px_55px_rgba(0,0,0,0.45)] sm:block"
              >
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={movie.title}
                    fill
                    sizes="180px"
                    className="object-cover"
                  />
                ) : (
                  <ImagePlaceholder title={movie.title} label="Poster no disponible" />
                )}
              </Link>

              <div className="flex max-w-3xl flex-col justify-end gap-4">
                <div className="inline-flex w-fit items-center gap-2 rounded-sm border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-200">
                  <Sparkles className="h-4 w-4" />
                  {movie.context_label ?? "Seleccion exacta"}
                </div>

                <div>
                  <h3 className="text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
                    {movie.title}
                  </h3>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-white/72">
                    <span>{year}</span>
                    <span className="h-1 w-1 rounded-full bg-white/45" />
                    <span>TMDB {rating}/10</span>
                    <span className="h-1 w-1 rounded-full bg-white/45" />
                    <span>Elegida para esta {slotLabel}</span>
                  </div>
                </div>

                <p className="line-clamp-3 max-w-2xl text-sm leading-7 text-white/82 sm:text-base">
                  {movie.overview || "Una recomendacion directa para no perder tiempo eligiendo."}
                </p>

                <p className="max-w-2xl rounded-sm border border-white/10 bg-black/35 px-4 py-3 text-sm leading-6 text-white/72">
                  {movie.reason}
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/peli/${movie.id}`}
                    className="inline-flex items-center gap-2 rounded-sm bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-white/90"
                  >
                    <Play className="h-4 w-4" />
                    Ver ficha
                  </Link>
                  <button
                    type="button"
                    onClick={handleRotateMovie}
                    disabled={status === "loading"}
                    className="inline-flex items-center rounded-sm border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    Buscar otra
                  </button>
                  <button
                    type="button"
                    onClick={handleMarkViewed}
                    disabled={isViewed}
                    className="inline-flex items-center gap-2 rounded-sm border border-emerald-300/30 bg-emerald-400/12 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-400/18 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <Check className="h-4 w-4" />
                    {isViewed ? "Vista" : "Marcar vista"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {(status === "error" || status === "empty") && (
          <div className="flex min-h-[360px] items-center justify-center p-6 text-center">
            <div>
              <p className="text-lg font-black uppercase text-white">
                No pude elegir una pelicula ahora mismo
              </p>
              <p className="mt-2 text-sm text-white/62">
                Prueba otra vez o agrega favoritos para afinar la recomendacion.
              </p>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
