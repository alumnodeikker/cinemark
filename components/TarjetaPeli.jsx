"use client";

import Image from "next/image";
import Link from "next/link";
import BotonFavorito from "./BotonFavorito";

function formatearRating(rating = 0) {
  return Math.round(rating * 10) / 10;
}

export default function TarjetaPeli({
  id = null,
  titulo = "Peli",
  descripcion = "Descripcion",
  rating = 0,
  imagenPath = null,
  backdropPath = null,
  pelicula = null,
  onFavoritoChange = null,
  modo = "grid",
}) {
  const imageUrl = imagenPath
    ? `https://image.tmdb.org/t/p/w500${imagenPath}`
    : null;
  const backdropUrl = backdropPath
    ? `https://image.tmdb.org/t/p/original${backdropPath}`
    : imageUrl;
  const peliculaData =
    pelicula ?? {
      id,
      title: titulo,
      overview: descripcion,
      vote_average: rating,
      poster_path: imagenPath,
      backdrop_path: backdropPath,
    };
  const year = peliculaData?.release_date?.split("-")?.[0] ?? "N/D";
  const ratingLabel = formatearRating(rating);

  if (modo === "hero") {
    return (
      <article className="hero-card relative overflow-hidden rounded-[1.75rem] border border-white/10">
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt={titulo}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,140,255,0.18),transparent_30%),linear-gradient(90deg,rgba(3,6,14,0.98)_0%,rgba(3,6,14,0.84)_36%,rgba(3,6,14,0.58)_60%,rgba(3,6,14,0.92)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#03060e] via-[#03060e]/20 to-black/30" />

        <div className="relative z-10 flex h-full flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-200/85">
                <span className="rounded-full border border-blue-400/25 bg-blue-500/10 px-3 py-1 text-[10px]">
                  Seleccion destacada
                </span>
                <span>Inicio</span>
              </div>

              <div>
                <h1 className="max-w-3xl text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl lg:text-6xl">
                  {titulo}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/70">
                  <span>{year}</span>
                  <span className="h-1 w-1 rounded-full bg-blue-400/70" />
                  <span>Popular ahora</span>
                  <span className="h-1 w-1 rounded-full bg-blue-400/70" />
                  <span>TMDB {ratingLabel}/10</span>
                </div>
              </div>
            </div>

            <div className="grid min-w-[220px] grid-cols-3 gap-3 text-center text-white sm:min-w-[280px]">
              <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
                  Calificacion
                </p>
                <p className="mt-2 text-xl font-black text-blue-300">{ratingLabel}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
                  Favoritos
                </p>
                <div className="mt-1 flex justify-center">
                  <BotonFavorito
                    key={`hero-${peliculaData?.id ?? id}`}
                    pelicula={peliculaData}
                    onChange={onFavoritoChange}
                  />
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
                  Estado
                </p>
                <p className="mt-2 text-sm font-bold text-white">En cartelera</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_180px]">
            <Link
              href={id ? `/peli/${id}` : "#"}
              className="relative block overflow-hidden rounded-[1.35rem] border border-white/10 bg-black/40 shadow-[0_22px_55px_rgba(0,0,0,0.35)]"
            >
              <div className="relative aspect-[2/3]">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={titulo}
                    fill
                    sizes="(max-width: 1024px) 50vw, 220px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-neutral-900 text-sm text-white/45">
                    Sin imagen
                  </div>
                )}
              </div>
            </Link>

            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/30">
              {backdropUrl && (
                <Image
                  src={backdropUrl}
                  alt={`${titulo} backdrop`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 900px"
                  className="object-cover opacity-45"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/50" />
              <div className="relative flex min-h-[280px] flex-col justify-end gap-4 p-5 sm:p-6">
                <div className="max-w-2xl space-y-3">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-blue-200">
                    Vista principal
                  </div>
                  <p className="max-w-2xl text-sm leading-7 text-white/82 sm:text-base">
                    {descripcion || "Selecciona esta pelicula para ver su ficha completa, trailer y mas informacion."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={id ? `/peli/${id}` : "#"}
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
                  >
                    Ver ficha completa
                  </Link>
                  <Link
                    href={id ? `/peli/${id}#trailer` : "#"}
                    className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/30 px-5 py-3 text-sm font-semibold text-white transition hover:border-blue-300/40 hover:bg-white/8"
                  >
                    Ver trailer
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="flex min-h-[132px] flex-col justify-center rounded-[1.35rem] border border-white/10 bg-white/6 px-5 py-4 text-center backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/55">
                  Explorar
                </p>
                <p className="mt-3 text-2xl font-black text-white">+99</p>
                <p className="mt-1 text-sm text-white/65">titulos relacionados</p>
              </div>
              <div className="flex min-h-[132px] flex-col justify-center rounded-[1.35rem] border border-white/10 bg-white/6 px-5 py-4 text-center backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/55">
                  Trailer
                </p>
                <p className="mt-3 text-2xl font-black text-blue-300">HD</p>
                <p className="mt-1 text-sm text-white/65">listo para reproducir</p>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  const wrapperClass =
    modo === "rail"
      ? "w-[175px] shrink-0 sm:w-[205px]"
      : "w-full min-w-0";

  return (
    <article className={`${wrapperClass} group`}>
      <Link
        href={id ? `/peli/${id}` : "#"}
        className="relative block aspect-[2/3] overflow-hidden rounded-sm border border-white/12 bg-neutral-800 shadow-[0_18px_30px_rgba(0,0,0,0.35)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_30px_45px_rgba(0,0,0,0.52)]"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={titulo}
            fill
            sizes="(max-width: 768px) 50vw, 205px"
            className="object-cover transition duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-neutral-800 text-neutral-500">
            Sin imagen
          </div>
        )}

        <span className="absolute left-2 top-2 z-20 rounded-sm bg-blue-700/90 px-1.5 py-0.5 text-[10px] font-black tracking-wide text-white">
          C
        </span>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

        <div className="absolute left-2 right-2 top-2 flex items-center justify-between">
          <span className="ml-6 rounded-sm bg-black/75 px-1.5 py-1 text-[11px] font-bold text-amber-300">
            {ratingLabel}/10
          </span>

          <BotonFavorito
            key={peliculaData?.id ?? id}
            pelicula={peliculaData}
            onChange={onFavoritoChange}
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="line-clamp-2 text-sm font-bold uppercase tracking-wide text-white">
            {titulo}
          </h3>
        </div>
      </Link>

      <div className="mt-2 space-y-2 text-white">
        <div className="flex gap-2">
          <Link
            href={id ? `/peli/${id}#trailer` : "#"}
            className="flex-1 rounded-sm bg-blue-700 px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-blue-600 disabled:opacity-70"
          >
            Ver trailer
          </Link>
          <Link
            href={id ? `/peli/${id}` : "#"}
            className="rounded-sm border border-white/25 px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/90 transition hover:border-white/45 hover:bg-white/10"
          >
            Info
          </Link>
        </div>
      </div>
    </article>
  );
}
