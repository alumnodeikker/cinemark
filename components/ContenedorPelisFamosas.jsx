import Image from "next/image";
import Link from "next/link";
import { traerPeliculas } from "../lib/Api_";
import TarjetaPeli from "./TarjetaPeli";

export default async function ContenedorPelisFamosas() {
  const peliculas = await traerPeliculas();
  const destacada = peliculas?.[0] ?? null;
  const recientes = peliculas.slice(0, 10);
  const populares = peliculas.slice(10, 20).length
    ? peliculas.slice(10, 20)
    : peliculas.slice(0, 10);
  const destacadaBackdrop = destacada?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${destacada.backdrop_path}`
    : null;
  const ratingMatch = Math.round((destacada?.vote_average ?? 0) * 10);
  const year = destacada?.release_date?.split("-")?.[0] ?? "N/D";

  return (
    <section className="space-y-7">
      <article className="relative min-h-[55vh] overflow-hidden rounded-sm border border-white/10">
        {destacadaBackdrop && (
          <Image
            src={destacadaBackdrop}
            alt={destacada?.title ?? "Pelicula destacada"}
            fill
            priority
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

        <div className="relative z-10 flex h-full max-w-xl flex-col justify-end gap-3 px-4 py-6 sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">
            Serie Pelicula
          </p>
          <h1 className="text-3xl font-black uppercase leading-tight sm:text-5xl">
            {destacada?.title ?? "Catalogo de Peliculas"}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-bold text-emerald-400">{ratingMatch}% de coincidencia</span>
            <span className="text-white/70">{year}</span>
            <span className="rounded-sm border border-white/20 px-1.5 py-0.5 text-xs">
              HD
            </span>
          </div>

          <p className="line-clamp-3 max-w-lg text-base text-white/85">
            {destacada?.overview ?? "Selecciona una pelicula para ver su ficha completa."}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href={
                destacada?.id
                  ? `/peli/${destacada.id}`
                  : "/buscar"
              }
              className="rounded-sm bg-white px-5 py-2 text-sm font-bold text-black hover:bg-white/90"
            >
              Reproducir
            </Link>
            <Link
              href={destacada?.id ? `/peli/${destacada.id}` : "/buscar"}
              className="rounded-sm border border-white/40 bg-white/12 px-5 py-2 text-sm font-semibold text-white hover:bg-white/20"
            >
              Mas informacion
            </Link>
          </div>
        </div>
      </article>

      <section className="space-y-3">
        <h2 className="text-3xl font-black uppercase tracking-wide text-white">
          Tendencias ahora
        </h2>
        <div className="poster-rail">
          {recientes.map((peli) => (
            <TarjetaPeli
              key={peli.id}
              id={peli.id}
              titulo={peli.title}
              descripcion={peli.overview}
              rating={peli.vote_average}
              imagenPath={peli.poster_path}
              pelicula={peli}
              modo="rail"
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-3xl font-black uppercase tracking-wide text-white">
          Popular en Cinemark
        </h2>
        <div className="poster-rail">
          {populares.map((peli) => (
            <TarjetaPeli
              key={peli.id}
              id={peli.id}
              titulo={peli.title}
              descripcion={peli.overview}
              rating={peli.vote_average}
              imagenPath={peli.poster_path}
              pelicula={peli}
              modo="rail"
            />
          ))}
        </div>
      </section>
    </section>
  );
}
