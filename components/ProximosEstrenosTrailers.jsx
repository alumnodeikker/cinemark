"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useLocalStorageList, writeList } from "@/lib/useLocalStorageList";

const WATCHLIST_KEY = "proximos_estrenos_guardados";
const FAVORITES_KEY = "favoritos";

function buildYoutubeWatchUrl(key) {
  if (!key) return "#";
  return `https://www.youtube.com/watch?v=${key}`;
}

function formatReleaseDate(date) {
  if (!date) return "PROX.";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "PROX.";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
  })
    .format(parsed)
    .replace(".", "")
    .toUpperCase();
}

function buildMovieItem(movie) {
  return {
    id: movie.id,
    title: movie.title ?? "",
    overview: movie.overview ?? "",
    vote_average: movie.vote_average ?? 0,
    poster_path: movie.poster_path ?? null,
    backdrop_path: movie.backdrop_path ?? null,
  };
}

function ReactionButton({ active, count, label, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-7 min-w-12 items-center justify-center gap-1 rounded-sm px-1 text-xs font-semibold transition ${
        active ? "text-amber-300" : "text-white/78 hover:text-white"
      }`}
    >
      {children}
      <span>{count}</span>
    </button>
  );
}

export default function ProximosEstrenosTrailers({ peliculas = [] }) {
  const scrollRef = useRef(null);
  const watchlist = useLocalStorageList(WATCHLIST_KEY);
  const favoritas = useLocalStorageList(FAVORITES_KEY);
  const [reacciones, setReacciones] = useState({});

  const baseCounts = useMemo(() => {
    return Object.fromEntries(
      peliculas.map((movie) => [
        movie.id,
        {
          like: Math.max(25, Math.round((movie.vote_count ?? 0) / 18)),
          love: Math.max(18, Math.round((movie.popularity ?? 0) * 1.6)),
        },
      ])
    );
  }, [peliculas]);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -340 : 340,
      behavior: "smooth",
    });
  };

  const toggleWatchlist = (movie) => {
    const exists = watchlist.some((item) => item.id === movie.id);
    writeList(
      WATCHLIST_KEY,
      exists
        ? watchlist.filter((item) => item.id !== movie.id)
        : [...watchlist, buildMovieItem(movie)]
    );
  };

  const toggleFavorite = (movie) => {
    const exists = favoritas.some((item) => item.id === movie.id);
    writeList(
      FAVORITES_KEY,
      exists
        ? favoritas.filter((item) => item.id !== movie.id)
        : [...favoritas, buildMovieItem(movie)]
    );
  };

  const toggleReaction = (movieId, type) => {
    setReacciones((current) => {
      const currentValue = current[movieId]?.[type] ?? false;
      return {
        ...current,
        [movieId]: {
          ...current[movieId],
          [type]: !currentValue,
        },
      };
    });
  };

  if (!peliculas.length) return null;

  return (
    <section className="space-y-4 text-white">
      <div>
        <Link
          href="/populares"
          className="inline-flex items-center gap-2 text-2xl font-black tracking-normal text-white transition hover:text-amber-300 sm:text-3xl"
        >
          <span className="h-7 w-1 bg-amber-400" />
          Proximamente en cines
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor">
            <path d="m9 5 7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <p className="mt-1 text-base text-white/78 sm:text-lg">Trailers de proximos lanzamientos</p>
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label="Ver trailers anteriores"
          onClick={() => scroll("left")}
          className="absolute left-0 top-[5.4rem] z-10 hidden h-16 w-10 -translate-y-1/2 items-center justify-center rounded-r-sm border border-l-0 border-white/20 bg-black/75 text-white transition hover:bg-black sm:inline-flex"
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor">
            <path d="m15 5-7 7 7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div ref={scrollRef} className="poster-rail gap-4 pb-2 sm:px-1">
          {peliculas.map((movie) => {
            const isSaved = watchlist.some((item) => item.id === movie.id);
            const isFavorite = favoritas.some((item) => item.id === movie.id);
            const liked = reacciones[movie.id]?.like ?? false;
            const loved = reacciones[movie.id]?.love ?? false;
            const counts = baseCounts[movie.id] ?? { like: 25, love: 18 };
            const backdropUrl = movie.backdrop_path
              ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
              : movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : null;

            return (
              <article key={movie.id} className="w-[316px] shrink-0 sm:w-[320px]">
                <Link
                  href={`/peli/${movie.id}#trailer`}
                  className="group relative block aspect-video w-full overflow-hidden rounded-sm bg-zinc-900 text-left"
                  aria-label={`Reproducir trailer de ${movie.title}`}
                >
                  {backdropUrl ? (
                    <Image
                      src={backdropUrl}
                      alt={movie.title}
                      fill
                      sizes="320px"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-white/45">
                      Sin imagen
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-black/35 text-white">
                    <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <span className="absolute bottom-3 left-12 text-sm font-semibold text-white">
                    Trailer
                  </span>
                </Link>

                <div className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 pt-3">
                  <button
                    type="button"
                    aria-pressed={isSaved}
                    aria-label={isSaved ? "Quitar de proximos guardados" : "Guardar estreno"}
                    onClick={() => toggleWatchlist(movie)}
                    className={`relative h-10 w-8 border border-white/12 text-2xl leading-none transition ${
                      isSaved ? "bg-amber-400 text-black" : "bg-white/10 text-white hover:bg-white/18"
                    }`}
                  >
                    <span className="absolute inset-x-0 top-0 flex justify-center">+</span>
                    <span className="absolute -bottom-2 left-0 h-0 w-0 border-l-[15px] border-r-[15px] border-t-[9px] border-l-transparent border-r-transparent border-t-current opacity-30" />
                  </button>

                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-white/70">
                      {formatReleaseDate(movie.release_date)}
                    </p>
                    <Link
                      href={`/peli/${movie.id}#trailer`}
                      className="mt-0.5 block truncate text-base font-bold leading-tight text-white hover:text-amber-300"
                    >
                      {movie.title}
                    </Link>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <a
                        href={buildYoutubeWatchUrl(movie.trailer_key)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-7 items-center justify-center rounded-sm px-1 text-xs font-semibold text-blue-300 transition hover:text-blue-200"
                      >
                        YouTube
                      </a>

                      <ReactionButton
                        active={liked}
                        count={counts.like + (liked ? 1 : 0)}
                        label={liked ? "Quitar me gusta" : "Me gusta"}
                        onClick={() => toggleReaction(movie.id, "like")}
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
                          <path d="M7 11v9H4v-9h3Zm3 9h7.2c.9 0 1.7-.6 1.9-1.5l1.2-5.1A2 2 0 0 0 18.4 11H14V6.8c0-.9-.7-1.8-1.6-1.8h-.3L8 11v9h2Z" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </ReactionButton>

                      <ReactionButton
                        active={loved || isFavorite}
                        count={counts.love + (loved || isFavorite ? 1 : 0)}
                        label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                        onClick={() => {
                          toggleReaction(movie.id, "love");
                          toggleFavorite(movie);
                        }}
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill={loved || isFavorite ? "currentColor" : "none"} stroke="currentColor">
                          <path d="m12 20-1.2-1C6.2 15 3 12.2 3 8.8 3 6.2 5.1 4 7.7 4c1.5 0 3 .8 3.8 2 .8-1.2 2.3-2 3.8-2C17.9 4 20 6.2 20 8.8c0 3.4-3.2 6.2-7.8 10.2z" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </ReactionButton>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Ver mas trailers"
          onClick={() => scroll("right")}
          className="absolute right-0 top-[5.4rem] z-10 hidden h-16 w-10 -translate-y-1/2 items-center justify-center rounded-l-sm border border-r-0 border-white/20 bg-black/75 text-white transition hover:bg-black sm:inline-flex"
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor">
            <path d="m9 5 7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}
