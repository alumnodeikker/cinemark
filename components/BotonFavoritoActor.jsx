"use client";

import { useState } from "react";

const STORAGE_KEY = "favoritos_actores";

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
    // noop
  }
}

function esFavorito(idActor) {
  if (!idActor) return false;
  return leerFavoritos().some((p) => p.id === idActor);
}

export default function BotonFavoritoActor({ persona = null }) {
  const [favorito, setFavorito] = useState(() => {
    if (typeof window === "undefined") return false;
    return esFavorito(persona?.id);
  });

  const toggleFavorito = () => {
    if (!persona?.id) return;
    const lista = leerFavoritos();
    const existe = lista.some((p) => p.id === persona.id);

    if (existe) {
      guardarFavoritos(lista.filter((p) => p.id !== persona.id));
      setFavorito(false);
      return;
    }

    const item = {
      id: persona.id,
      name: persona.name ?? "",
      profile_path: persona.profile_path ?? null,
      popularity: persona.popularity ?? 0,
    };

    guardarFavoritos([...lista, item]);
    setFavorito(true);
  };

  return (
    <button
      type="button"
      onClick={toggleFavorito}
      aria-pressed={favorito}
      aria-label={favorito ? "Quitar actor de favoritos" : "Agregar actor a favoritos"}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/35"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill={favorito ? "currentColor" : "none"} stroke="currentColor">
        <path
          d="m12 20-1.2-1C6.2 15 3 12.2 3 8.8 3 6.2 5.1 4 7.7 4c1.5 0 3 .8 3.8 2 .8-1.2 2.3-2 3.8-2C17.9 4 20 6.2 20 8.8c0 3.4-3.2 6.2-7.8 10.2z"
          strokeWidth="1.7"
          className={favorito ? "text-blue-300" : "text-white/75"}
        />
      </svg>
    </button>
  );
}

