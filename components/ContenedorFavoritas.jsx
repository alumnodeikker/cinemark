"use client";

import { useEffect, useState } from "react";
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
  const [favoritas, setFavoritas] = useState([]);

  useEffect(() => {
    setFavoritas(leerFavoritos());
  }, []);

  return (
    <main>
      <div className="flex flex-wrap gap-4 p-4">
        {favoritas.length === 0 ? (
          <p className="text-white">No tienes favoritos todavia.</p>
        ) : (
          favoritas.map((peli) => (
            <TarjetaPeli
              key={peli.id}
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
            />
          ))
        )}
      </div>
    </main>
  );
}
