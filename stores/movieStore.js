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

function userCommentItem(comment) {
  return {
    id: comment.id,
    movieId: String(comment.movieId),
    movieTitle: comment.movieTitle ?? "",
    parentId: comment.parentId ?? null,
    authorId: comment.authorId,
    authorName: comment.authorName,
    body: comment.body,
    likes: comment.likes ?? 0,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt ?? comment.createdAt,
  };
}

function sanitizeText(value, maxLength = 800) {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function defaultUser() {
  return {
    id: "local-user",
    name: "Usuario Cinemark",
    email: "usuario@local.test",
    avatar: "",
    bio: "",
    createdAt: new Date().toISOString(),
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
      viewedHistory: [],
      comments: [],
      user: null,
      authView: "login",
      
      // Geolocation & Location Data
      geolocation: {
        latitude: null,
        longitude: null,
        accuracy: null,
        countryCode: null,
        countryName: null,
        lastUpdated: null,
      },
      geolocationConsent: false,
      
      // Caches
      cachedCinemas: {},
      cachedStreaming: {},

      registerUser: ({ name, email, password }) => {
        const safeName = sanitizeText(name, 70) || "Usuario Cinemark";
        const safeEmail = sanitizeText(email, 120).toLowerCase();
        if (!safeEmail || !sanitizeText(password, 120)) return false;
        set({
          user: {
            ...defaultUser(),
            id: `user-${Date.now()}`,
            name: safeName,
            email: safeEmail,
          },
          authView: "profile",
        });
        return true;
      },

      loginUser: ({ email }) => {
        const current = get().user ?? defaultUser();
        set({
          user: {
            ...current,
            email: sanitizeText(email, 120).toLowerCase() || current.email,
          },
          authView: "profile",
        });
        return true;
      },

      logoutUser: () => set({ user: null, authView: "login" }),
      setAuthView: (authView) => set({ authView }),

      updateUser: (updates) => {
        const current = get().user ?? defaultUser();
        set({
          user: {
            ...current,
            name: sanitizeText(updates.name, 70) || current.name,
            email: sanitizeText(updates.email, 120).toLowerCase() || current.email,
            avatar: sanitizeText(updates.avatar, 300),
            bio: sanitizeText(updates.bio, 240),
          },
        });
      },

      markViewed: (movie) => {
        if (!movie?.id) return;
        const item = {
          ...movieItem(movie),
          viewedAt: new Date().toISOString(),
        };
        set({
          viewedHistory: [
            item,
            ...get().viewedHistory.filter((current) => current.id !== item.id),
          ].slice(0, 60),
        });
      },

      addComment: ({ movieId, movieTitle, body, parentId = null }) => {
        const text = sanitizeText(body);
        if (text.length < 3) return false;
        const tooManyLinks = (text.match(/https?:\/\//gi) ?? []).length > 1;
        const repeated = /(.)\1{8,}/.test(text);
        if (tooManyLinks || repeated) return false;

        const user = get().user ?? defaultUser();
        const now = new Date().toISOString();
        const comment = userCommentItem({
          id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          movieId,
          movieTitle,
          parentId,
          authorId: user.id,
          authorName: user.name,
          body: text,
          likes: 0,
          createdAt: now,
          updatedAt: now,
        });
        set({ comments: [comment, ...get().comments] });
        return true;
      },

      editComment: (id, body) => {
        const text = sanitizeText(body);
        if (text.length < 3) return false;
        const user = get().user ?? defaultUser();
        set({
          comments: get().comments.map((comment) =>
            comment.id === id && comment.authorId === user.id
              ? { ...comment, body: text, updatedAt: new Date().toISOString() }
              : comment
          ),
        });
        return true;
      },

      deleteComment: (id) => {
        const user = get().user ?? defaultUser();
        const idsToRemove = new Set([id]);
        get().comments.forEach((comment) => {
          if (comment.parentId === id) idsToRemove.add(comment.id);
        });
        set({
          comments: get().comments.filter(
            (comment) => !idsToRemove.has(comment.id) || comment.authorId !== user.id
          ),
        });
      },

      likeComment: (id) => {
        set({
          comments: get().comments.map((comment) =>
            comment.id === id ? { ...comment, likes: (comment.likes ?? 0) + 1 } : comment
          ),
        });
      },

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

      // Geolocation methods
      setGeolocation: (geoData) => {
        set({
          geolocation: {
            ...geoData,
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      setGeolocationConsent: (consent) => {
        set({ geolocationConsent: consent });
      },

      clearGeolocation: () => {
        set({
          geolocation: {
            latitude: null,
            longitude: null,
            accuracy: null,
            countryCode: null,
            countryName: null,
            lastUpdated: null,
          },
          geolocationConsent: false,
        });
      },

      // Cache methods
      setCachedCinemas: (movieId, cinemas) => {
        const current = get().cachedCinemas;
        set({
          cachedCinemas: {
            ...current,
            [movieId]: {
              data: cinemas,
              timestamp: Date.now(),
            },
          },
        });
      },

      getCachedCinemas: (movieId) => {
        const cache = get().cachedCinemas[movieId];
        if (!cache) return null;
        
        // Cache válido por 1 hora
        if (Date.now() - cache.timestamp > 60 * 60 * 1000) {
          return null;
        }
        
        return cache.data;
      },

      setCachedStreaming: (movieId, streaming) => {
        const current = get().cachedStreaming;
        set({
          cachedStreaming: {
            ...current,
            [movieId]: {
              data: streaming,
              timestamp: Date.now(),
            },
          },
        });
      },

      getCachedStreaming: (movieId) => {
        const cache = get().cachedStreaming[movieId];
        if (!cache) return null;
        
        // Cache válido por 24 horas
        if (Date.now() - cache.timestamp > 24 * 60 * 60 * 1000) {
          return null;
        }
        
        return cache.data;
      },
    }),
    {
      name: "cinemark-state",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ favorites, watchlist, favoriteActors, viewedHistory, comments, user, geolocation, geolocationConsent }) => ({
        favorites,
        watchlist,
        favoriteActors,
        viewedHistory,
        comments,
        user,
        geolocation,
        geolocationConsent,
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
          viewedHistory: persisted.viewedHistory ?? [],
          comments: persisted.comments ?? [],
          user: persisted.user ?? null,
          geolocation: persisted.geolocation ?? currentState.geolocation,
          geolocationConsent: persisted.geolocationConsent ?? false,
        };
      },
    }
  )
);
