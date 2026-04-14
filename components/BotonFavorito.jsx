"use client";

import { useState } from "react";

const STORAGE_KEY = "favoritos";

function leerFavoritos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function guardarFavoritos(lista) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch {
    // Ignorar errores de storage
  }
}

function esFavorita(idPelicula) {
  if (!idPelicula) return false;
  const lista = leerFavoritos();
  return lista.some((p) => p.id === idPelicula);
}

export default function BotonFavorito({ pelicula = null, onChange = null }) {
  const [favorito, setFavorito] = useState(() => {
    if (typeof window === "undefined") return false;
    return esFavorita(pelicula?.id);
  });

  const toggleFavorito = () => {
    if (!pelicula?.id) return;
    const lista = leerFavoritos();
    const existe = lista.some((p) => p.id === pelicula.id);

    let nuevaLista;
    let nuevoEstado;

    if (existe) {
      nuevaLista = lista.filter((p) => p.id !== pelicula.id);
      nuevoEstado = false;
    } else {
      const item = {
        id: pelicula.id,
        title: pelicula.title ?? "",
        overview: pelicula.overview ?? "",
        vote_average: pelicula.vote_average ?? 0,
        poster_path: pelicula.poster_path ?? null,
      };
      nuevaLista = [...lista, item];
      nuevoEstado = true;
    }

    guardarFavoritos(nuevaLista);
    setFavorito(nuevoEstado);
    if (onChange) onChange(nuevoEstado);
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
