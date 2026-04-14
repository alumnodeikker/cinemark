"use client";

import Image from "next/image";
import Link from "next/link";
import BotonFavorito from "./BotonFavorito";

export default function TarjetaPeli({
  id = null,
  titulo = "Peli",
  descripcion = "Descripcion",
  rating = 0,
  imagenPath = null,
  pelicula = null,
  onFavoritoChange = null,
  modo = "grid",
}) {
  const imageUrl = imagenPath
    ? `https://image.tmdb.org/t/p/w500${imagenPath}`
    : null;

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
            ⭐ {Math.round(rating * 10) / 10}
          </span>
          <BotonFavorito
            key={pelicula?.id ?? id}
            pelicula={
              pelicula ?? {
                id,
                title: titulo,
                overview: descripcion,
                vote_average: rating,
                poster_path: imagenPath,
              }
            }
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
