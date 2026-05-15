"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const LEGACY_KEYS = {
  favorites: "favoritos",
  watchlist: "proximos_estrenos_guardados",
  favoriteActors: "favoritos_actores",
};

function readLegacyList(key) {
  if (typeof window === "undefined") return [];

  try {
    const data = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function movieItem(movie) {
  return {
    id: movie.id,
    title: movie.title ?? "",
    overview: movie.overview ?? "",
    vote_average: movie.vote_average ?? 0,
    poster_path: movie.poster_path ?? null,
    backdrop_path: movie.backdrop_path ?? null,
  };
}

function actorItem(persona) {
  return {
    id: persona.id,
    name: persona.name ?? "",
    profile_path: persona.profile_path ?? null,
    popularity: persona.popularity ?? 0,
  };
}

function toggleById(list, item) {
  return list.some((current) => current.id === item.id)
    ? list.filter((current) => current.id !== item.id)
    : [...list, item];
}

export const useMovieStore = create(
  persist(
    (set, get) => ({
      favorites: [],
      watchlist: [],
      favoriteActors: [],

      toggleFavorite: (movie) => {
        if (!movie?.id) return false;
        const item = movieItem(movie);
        const nextFavorites = toggleById(get().favorites, item);
        set({ favorites: nextFavorites });
        return nextFavorites.some((current) => current.id === item.id);
      },

      toggleWatchlist: (movie) => {
        if (!movie?.id) return false;
        const item = movieItem(movie);
        const nextWatchlist = toggleById(get().watchlist, item);
        set({ watchlist: nextWatchlist });
        return nextWatchlist.some((current) => current.id === item.id);
      },

      toggleFavoriteActor: (persona) => {
        if (!persona?.id) return false;
        const item = actorItem(persona);
        const nextActors = toggleById(get().favoriteActors, item);
        set({ favoriteActors: nextActors });
        return nextActors.some((current) => current.id === item.id);
      },
    }),
    {
      name: "cinemark-state",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ favorites, watchlist, favoriteActors }) => ({
        favorites,
        watchlist,
        favoriteActors,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState ?? {};
        return {
          ...currentState,
          ...persisted,
          favorites: persisted.favorites?.length
            ? persisted.favorites
            : readLegacyList(LEGACY_KEYS.favorites),
          watchlist: persisted.watchlist?.length
            ? persisted.watchlist
            : readLegacyList(LEGACY_KEYS.watchlist),
          favoriteActors: persisted.favoriteActors?.length
            ? persisted.favoriteActors
            : readLegacyList(LEGACY_KEYS.favoriteActors),
        };
      },
    }
  )
);
