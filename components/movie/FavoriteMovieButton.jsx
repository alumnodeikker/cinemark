"use client";

import { useMovieStore } from "@/stores/movieStore";

export default function FavoriteMovieButton({ pelicula = null, onChange = null }) {
  const toggleFavorite = useMovieStore((state) => state.toggleFavorite);
  const favorito = useMovieStore((state) =>
    pelicula?.id ? state.favorites.some((p) => p.id === pelicula.id) : false
  );

  const toggleFavorito = () => {
    if (!pelicula?.id) return;
    const nuevoEstado = toggleFavorite(pelicula);
    onChange?.(nuevoEstado);
  };

  return (
    <button
      type="button"
      className="p-1"
      onClick={toggleFavorito}
      aria-pressed={favorito}
      aria-label={favorito ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
      >
        <path
          d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Z"
          strokeLinejoin="round"
          className={
            favorito
              ? "fill-blue-500 stroke-blue-700 transition-colors duration-200"
              : "fill-blue-500/10 stroke-blue-900 hover:fill-blue-500/30 transition-colors ease-in-out duration-300"
          }
        />
      </svg>
    </button>
  );
}
