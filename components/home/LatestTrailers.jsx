"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ImagePlaceholder from "@/components/movie/ImagePlaceholder";
import TrailerModal from "@/components/movie/TrailerModal";
import { useGeolocation } from "@/hooks/useGeolocation";

const FILTERS = [
  { id: "popular", label: "Popular" },
  { id: "streaming", label: "Streaming" },
  { id: "rent", label: "Alquiler" },
  { id: "cinema", label: "En cines" },
];

const ACCESS_LABELS = {
  subscription: "Streaming",
  rent: "Alquiler",
  buy: "Compra",
  free: "Gratis",
  ads: "TV / anuncios",
};

function safeProviderUrl(provider) {
  if (!provider?.url || provider.url.includes("themoviedb.org")) return null;
  return provider.url;
}

function formatReleaseDate(date) {
  if (!date) return "Proximamente";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Proximamente";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
  }).format(parsed);
}

function buildAvailabilityText(filter, location) {
  if (filter === "cinema") {
    return location?.latitude
      ? `Cartelera cerca de ${location.address || location.region || location.countryName || "tu ubicación"}`
      : `Cartelera y cines populares en ${location?.region || location?.countryName || "tu región"}`;
  }

  if (filter === "streaming") return "Películas populares disponibles por suscripción";
  if (filter === "tv") return "Películas disponibles gratis o con anuncios";
  if (filter === "rent") return "Películas populares en alquiler o compra digital";
  return "Trailers populares";
}

export default function LatestTrailers({ peliculas = [] }) {
  const { location, requestGeolocation, loading: locationLoading } = useGeolocation();
  const [activeFilter, setActiveFilter] = useState("popular");
  const [itemsByFilter, setItemsByFilter] = useState({ popular: peliculas });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastCinemaRequestRef = useRef(null);

  const activeItems = useMemo(
    () => {
      const items = itemsByFilter[activeFilter] || [];
      return activeFilter === "cinema"
        ? items
        : items.filter((movie) => Boolean(movie?.trailer_key));
    },
    [activeFilter, itemsByFilter]
  );

  const loadFilter = useCallback(async (filterId, force = false) => {
    setActiveFilter(filterId);
    setError(null);

    if (filterId === "popular" || (!force && itemsByFilter[filterId])) {
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        mode: filterId,
        countryCode: location?.countryCode || "ES",
      });
      if (location?.region) {
        params.set("region", location.region);
      }

      if (location?.latitude && location?.longitude) {
        params.set("latitude", String(location.latitude));
        params.set("longitude", String(location.longitude));
      }

      const response = await fetch(`/api/trailers/availability?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "No se pudo cargar la categoría");
      }

      setItemsByFilter((current) => ({
        ...current,
        [filterId]: result.data || [],
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [itemsByFilter, location?.countryCode, location?.latitude, location?.longitude, location?.region]);

  useEffect(() => {
    if (activeFilter === "cinema" && location?.latitude && location?.longitude) {
      const key = `${location.countryCode || "ES"}:${location.latitude}:${location.longitude}`;
      if (lastCinemaRequestRef.current === key) return;
      lastCinemaRequestRef.current = key;
      loadFilter("cinema", true);
    }
  }, [activeFilter, loadFilter, location?.countryCode, location?.latitude, location?.longitude]);

  async function handleEnableLocation() {
    await requestGeolocation();
    setItemsByFilter((current) => {
      const next = { ...current };
      delete next.cinema;
      return next;
    });
  }

  if (!peliculas.length) return null;

  return (
    <section className="space-y-4 text-white">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Trailers populares</h2>
          <p className="mt-1 text-sm text-white/65">
            {buildAvailabilityText(activeFilter, location)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => loadFilter(filter.id)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                activeFilter === filter.id
                  ? "border-emerald-300 bg-emerald-300 text-black"
                  : "border-white/25 bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {activeFilter === "cinema" && !location?.latitude && (
        <div className="rounded-sm border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-50">
          Mostrando cines populares por país/región. Activa ubicación si quieres ordenar por distancia real.
          <button
            type="button"
            onClick={handleEnableLocation}
            disabled={locationLoading}
            className="ml-3 rounded-sm bg-amber-300 px-3 py-1 font-bold text-black disabled:opacity-60"
          >
            {locationLoading ? "Detectando..." : "Activar ubicación"}
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-sm border border-red-300/30 bg-red-500/10 p-4 text-sm text-red-100">
          {error}
        </div>
      )}

      <article className="relative overflow-hidden rounded-sm border border-white/10 bg-[linear-gradient(180deg,rgba(11,31,53,0.9)_0%,rgba(7,10,15,0.95)_65%)] p-4 sm:p-5">
        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center text-sm font-semibold text-white/70">
            Cargando opciones...
          </div>
        ) : activeItems.length ? (
          <div className="poster-rail relative gap-4 pb-2">
            {activeItems.map((movie) => (
              <TrailerCard key={`${activeFilter}-${movie.id}`} movie={movie} filter={activeFilter} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[240px] items-center justify-center text-center text-sm text-white/70">
            No encontramos resultados para esta categoría en tu zona.
          </div>
        )}
      </article>
    </section>
  );
}

function TrailerCard({ movie, filter }) {
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
    : movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null;

  return (
    <article className="w-[300px] shrink-0 sm:w-[360px]">
      <TrailerModal
        trailerKey={movie.trailer_key}
        title={`Trailer de ${movie.title}`}
        className="group block w-full text-left"
      >
        <div className="relative aspect-video overflow-hidden rounded-sm border border-white/10 bg-zinc-900">
          {backdropUrl ? (
            <Image
              src={backdropUrl}
              alt={movie.title}
              fill
              sizes="(max-width: 640px) 300px, 360px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <ImagePlaceholder title={movie.title} label="Miniatura no disponible" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
          <span className="absolute left-1/2 top-1/2 inline-flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/65 bg-black/45 text-white backdrop-blur-sm">
            <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>

        <div className="pt-3 text-center">
          <p className="line-clamp-2 text-2xl font-black leading-tight text-white">
            {movie.title}
          </p>
          <p className="mt-1 text-sm text-white/85">
            Trailer oficial - {formatReleaseDate(movie.release_date)}
          </p>
        </div>
      </TrailerModal>

      <AvailabilityActions movie={movie} filter={filter} />

      <div className="pt-2 text-center">
        <Link
          href={`/peli/${movie.id}`}
          className="inline-flex text-xs font-semibold text-blue-300 transition hover:text-blue-200"
        >
          Ver ficha
        </Link>
      </div>
    </article>
  );
}

function AvailabilityActions({ movie, filter }) {
  const providers = movie.availability?.providers || [];
  const cinemas = movie.availability?.cinemas || [];

  if (filter === "cinema") {
    if (!cinemas.length) {
      return (
        <p className="pt-2 text-center text-xs text-white/55">
          Abre la ficha para ver más información.
        </p>
      );
    }

    return (
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {cinemas.slice(0, 2).map((cinema) => (
          <a
            key={cinema.id}
            href={cinema.website || `/peli/${movie.id}`}
            target={cinema.website ? "_blank" : undefined}
            rel={cinema.website ? "noopener noreferrer" : undefined}
            className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100 hover:bg-emerald-300/20"
          >
            {cinema.name} · {cinema.distance} km
          </a>
        ))}
      </div>
    );
  }

  if (!providers.length) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      {providers.slice(0, 3).map((provider) => (
        safeProviderUrl(provider) ? (
          <a
            key={provider.provider_id}
            href={safeProviderUrl(provider)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/20 bg-white/8 px-3 py-1 text-xs font-semibold text-white hover:bg-white/14"
          >
            {provider.provider_name} · {ACCESS_LABELS[provider.access_type] || provider.access_type}
          </a>
        ) : (
          <span
            key={provider.provider_id}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/60"
            title="Esta plataforma no ofrece enlace directo público"
          >
            {provider.provider_name}
          </span>
        )
      ))}
    </div>
  );
}
