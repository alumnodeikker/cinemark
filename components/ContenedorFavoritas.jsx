"use client";

import { useState } from "react";
import TarjetaPeli from "./TarjetaPeli";

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

export default function ContenedorFavoritas() {
  const [favoritas, setFavoritas] = useState(() => {
    if (typeof window === "undefined") return [];
    return leerFavoritos();
  });

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
              <TarjetaPeli
                id={peli.id}
                titulo={peli.title}
                descripcion={peli.overview}
                rating={peli.vote_average}
                imagenPath={peli.poster_path}
                pelicula={peli}
                onFavoritoChange={(nuevoEstado) => {
                  if (!nuevoEstado) {
                    setFavoritas((prev) => prev.filter((p) => p.id !== peli.id));
                  }
                }}
                modo="grid"
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
