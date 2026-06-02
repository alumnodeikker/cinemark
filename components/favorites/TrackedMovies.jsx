"use client";

import Link from "next/link";
import { useMovieStore } from "@/stores/movieStore";
import MovieCard from "@/components/movie/MovieCard";

export default function TrackedMovies() {
  const trackedMovies = useMovieStore((state) => state.watchlist);
  const toggleWatchlist = useMovieStore((state) => state.toggleWatchlist);

  return (
    <section className="space-y-6">
      {trackedMovies.length === 0 ? (
        <div className="netflix-panel p-8 text-center">
          <p className="text-lg font-semibold uppercase text-white">
            No tienes estrenos en seguimiento
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-white/70">
            Pulsa el boton + en proximos estrenos para recibir un aviso cuando la pelicula llegue a cines.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-sm bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-white/90"
          >
            Ver proximos estrenos
          </Link>
        </div>
      ) : (
        <div className="movie-grid">
          {trackedMovies.map((peli) => (
            <div key={peli.id} className="fade-up relative space-y-3">
              <div className="pointer-events-none absolute right-2 top-11 z-20 max-w-[calc(100%-1rem)]">
                <div className="relative rounded-sm bg-amber-400 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-black shadow-[0_10px_22px_rgba(0,0,0,0.45)]">
                  En seguimiento
                  <span className="absolute -bottom-1 right-3 h-2 w-2 rotate-45 bg-amber-400" />
                </div>
              </div>
              <MovieCard
                id={peli.id}
                titulo={peli.title}
                descripcion={peli.overview}
                rating={peli.vote_average}
                imagenPath={peli.poster_path}
                backdropPath={peli.backdrop_path}
                pelicula={peli}
                modo="grid"
                showActions={false}
              />
              <div>
                <button
                  type="button"
                  onClick={() => toggleWatchlist(peli)}
                  className="w-full rounded-sm border border-white/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/78 transition hover:border-red-300/45 hover:bg-red-500/10 hover:text-red-100"
                >
                  Dejar de seguir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
