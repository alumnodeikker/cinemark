"use client";

import { useMovieStore } from "@/stores/movieStore";
import MovieCard from "@/components/movie/MovieCard";

export default function FavoriteMovies() {
  const favoritas = useMovieStore((state) => state.favorites);

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
                pelicula={peli}
                modo="grid"
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
