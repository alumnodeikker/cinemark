import "server-only";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const THEATRICAL_RELEASE_TYPES = "2|3";

function addDaysIso(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isAllowedRelease(movie) {
  const releaseDate = movie?.release_date;
  if (!releaseDate) return false;
  return releaseDate >= addDaysIso(-120) && releaseDate <= addDaysIso(240);
}

function filterAllowedReleases(movies = []) {
  return Array.isArray(movies) ? movies.filter(isAllowedRelease) : [];
}

function buildTmdbHeaders() {
  const token = process.env.TMDB_ACCESS_TOKEN;

  if (!token) {
    throw new Error(
      "Falta la variable TMDB_ACCESS_TOKEN. Configurala en el servidor para proteger la API."
    );
  }

  return {
    accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function tmdbGet(path, query = {}) {
  const cleanQuery = Object.fromEntries(
    Object.entries(query).filter(([_, value]) => value != null && value !== "")
  );

  const url = `${TMDB_BASE_URL}${path}?${new URLSearchParams(cleanQuery)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: buildTmdbHeaders(),
    cache: "force-cache",
    next: { revalidate: 1800 },
  });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(
        "TMDB error: 401 (credenciales invalidas). Revisa TMDB_ACCESS_TOKEN/TMDB_API_KEY."
      );
    }
    throw new Error(`TMDB error: ${res.status}`);
  }

  return res.json();
}

function pickYoutubeVideo(videos = []) {
  if (!Array.isArray(videos) || videos.length === 0) {
    return null;
  }

  return (
    videos.find(
      (video) =>
        video?.site === "YouTube" &&
        video?.type === "Trailer" &&
        video?.official === true
    ) ||
    videos.find(
      (video) => video?.site === "YouTube" && video?.type === "Trailer"
    ) ||
    videos.find((video) => video?.site === "YouTube") ||
    null
  );
}

export function buildYoutubeEmbedUrl(key) {
  if (!key) return null;
  return `https://www.youtube-nocookie.com/embed/${key}?rel=0&modestbranding=1`;
}

export async function getPopularMovies() {
  try {
    const datos = await tmdbGet("/trending/movie/week", {
      language: "es-ES",
      page: 1,
    });
    return filterAllowedReleases(datos?.results);
  } catch (error) {
    console.error("Error al traer peliculas:", error);
    return [];
  }
}

export async function getNowPlayingMovies() {
  try {
    const datos = await tmdbGet("/movie/now_playing", {
      language: "es-ES",
      page: 1,
      region: "ES",
    });
    return filterAllowedReleases(datos?.results);
  } catch (error) {
    console.error("Error al traer peliculas recientes:", error);
    return [];
  }
}

export async function getWeeklyTopMovies() {
  try {
    const datos = await tmdbGet("/discover/movie", {
      "primary_release_date.gte": addDaysIso(-120),
      "primary_release_date.lte": addDaysIso(60),
      include_adult: "false",
      include_video: "false",
      language: "es-ES",
      page: 1,
      region: "ES",
      sort_by: "vote_count.desc",
      with_release_type: THEATRICAL_RELEASE_TYPES,
    });
    const lista = filterAllowedReleases(datos?.results);
    return lista.slice(0, 10);
  } catch (error) {
    console.error("Error al traer top semanal:", error);
    return [];
  }
}

export async function getTopRatedMovies() {
  try {
    const datos = await tmdbGet("/discover/movie", {
      include_adult: "false",
      include_video: "false",
      language: "es-ES",
      page: 1,
      region: "ES",
      sort_by: "vote_average.desc",
      "vote_count.gte": 5000,
    });

    return Array.isArray(datos?.results) ? datos.results.slice(0, 12) : [];
  } catch (error) {
    console.error("Error al traer peliculas mejor valoradas:", error);
    return [];
  }
}

export async function getUpcomingMoviesWithTrailers() {
  try {
    const datos = await tmdbGet("/movie/upcoming", {
      language: "es-ES",
      page: 1,
      region: "ES",
    });
    const lista = filterAllowedReleases(datos?.results);
    const conTrailers = await Promise.all(
      lista.slice(0, 12).map(async (peli) => ({
        ...peli,
        trailer_key: await getTrailerKey(peli.id),
      }))
    );

    return conTrailers.filter((peli) => peli.trailer_key).slice(0, 8);
  } catch (error) {
    console.error("Error al traer proximos estrenos:", error);
    return [];
  }
}

export async function getUpcomingMoviesSoon(daysAhead = 15, regionCode = "ES") {
  const region = String(regionCode || "ES").toUpperCase();

  try {
    const datos = await tmdbGet("/discover/movie", {
      include_adult: "false",
      include_video: "false",
      language: "es-ES",
      page: 1,
      "release_date.gte": addDaysIso(0),
      "release_date.lte": addDaysIso(daysAhead),
      region,
      sort_by: "release_date.asc",
      with_origin_country: region === "US" ? "US" : undefined,
      with_original_language: region === "US" ? "en" : undefined,
      with_release_type: THEATRICAL_RELEASE_TYPES,
    });

    return Array.isArray(datos?.results)
      ? datos.results.filter((movie) => movie.poster_path).slice(0, 12)
      : [];
  } catch (error) {
    console.error("Error al traer estrenos proximos:", error);
    return [];
  }
}

export async function getTrendingMoviesForRegion(regionCode = "ES") {
  const region = String(regionCode || "ES").toUpperCase();

  try {
    const datos = await tmdbGet("/discover/movie", {
      include_adult: "false",
      include_video: "false",
      language: "es-ES",
      page: 1,
      region,
      "release_date.gte": addDaysIso(-365),
      "release_date.lte": addDaysIso(0),
      sort_by: "popularity.desc",
      "vote_count.gte": 50,
      with_release_type: THEATRICAL_RELEASE_TYPES,
    });

    return Array.isArray(datos?.results)
      ? datos.results.filter((movie) => movie.poster_path).slice(0, 12)
      : [];
  } catch (error) {
    console.error("Error al traer tendencias regionales:", error);
    return [];
  }
}

export async function getLatestTrailers() {
  try {
    const datos = await tmdbGet("/discover/movie", {
      "primary_release_date.gte": addDaysIso(-45),
      "primary_release_date.lte": addDaysIso(180),
      include_adult: "false",
      include_video: "false",
      language: "es-ES",
      page: 1,
      region: "ES",
      sort_by: "popularity.desc",
      with_release_type: THEATRICAL_RELEASE_TYPES,
    });
    const lista = filterAllowedReleases(datos?.results);
    const resultados = [];

    for (const peli of lista.slice(0, 24)) {
      const data = await tmdbGet(`/movie/${peli.id}/videos`, {
        language: "es-ES",
      });
      const candidates = Array.isArray(data?.results)
        ? data.results.filter((video) => video?.site === "YouTube" && video?.key)
        : [];

      let playableKey = null;
      for (const video of candidates) {
        const watchUrl = `https://www.youtube.com/watch?v=${video.key}`;
        const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`;
        try {
          const response = await fetch(endpoint, {
            method: "GET",
            cache: "no-store",
          });
          if (response.ok) {
            playableKey = video.key;
            break;
          }
        } catch {
          continue;
        }
      }

      if (playableKey) {
        resultados.push({
          ...peli,
          trailer_key: playableKey,
        });
      }

      if (resultados.length >= 9) break;
    }

    return resultados;
  } catch (error) {
    console.error("Error al traer ultimos trailers:", error);
    return [];
  }
}

async function withTrailerKeys(movies = [], limit = 10) {
  const results = [];

  for (const movie of movies.slice(0, 24)) {
    const trailer_key = await getTrailerKey(movie.id);
    if (trailer_key) {
      results.push({ ...movie, trailer_key });
    }
    if (results.length >= limit) break;
  }

  return results;
}

export async function getMoviesByWatchMode(mode = "streaming", countryCode = "ES") {
  const monetizationByMode = {
    streaming: "flatrate",
    tv: "free|ads",
    rent: "rent|buy",
  };
  const region = String(countryCode || "ES").toUpperCase();
  const monetization = monetizationByMode[mode] || monetizationByMode.streaming;

  try {
    const data = await tmdbGet("/discover/movie", {
      include_adult: "false",
      include_video: "false",
      language: "es-ES",
      page: 1,
      region,
      sort_by: "popularity.desc",
      watch_region: region,
      with_watch_monetization_types: monetization,
    });

    return withTrailerKeys(data?.results ?? [], 10);
  } catch (error) {
    console.error("Error al traer peliculas por disponibilidad:", error);
    return [];
  }
}

export async function getCinemaMoviesForRegion(countryCode = "ES") {
  const region = String(countryCode || "ES").toUpperCase();

  try {
    const data = await tmdbGet("/movie/now_playing", {
      language: "es-ES",
      page: 1,
      region,
    });

    return withTrailerKeys(data?.results ?? [], 10);
  } catch (error) {
    console.error("Error al traer cartelera por region:", error);
    return [];
  }
}
export async function getPopularPeople() {
  try {
    const datos = await tmdbGet("/person/popular", { language: "es-ES", page: 1 });
    return Array.isArray(datos?.results) ? datos.results.slice(0, 15) : [];
  } catch (error) {
    console.error("Error al traer celebridades populares:", error);
    return [];
  }
}

export async function getCurrentTheatricalActors() {
  try {
    const [nowPlaying, weeklyTop] = await Promise.all([
      getNowPlayingMovies(),
      getWeeklyTopMovies(),
    ]);
    const moviesById = new Map();

    [...nowPlaying, ...weeklyTop]
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
      .slice(0, 12)
      .forEach((movie) => {
        if (movie?.id) moviesById.set(movie.id, movie);
      });

    const actorScores = new Map();

    for (const movie of moviesById.values()) {
      const credits = await tmdbGet(`/movie/${movie.id}/credits`, {
        language: "es-ES",
      });
      const cast = Array.isArray(credits?.cast) ? credits.cast.slice(0, 8) : [];
      const movieWeight = (movie.popularity ?? 0) + (movie.vote_count ?? 0) / 100;

      cast.forEach((actor, index) => {
        if (!actor?.id || !actor.profile_path) return;

        const current = actorScores.get(actor.id) || {
          id: actor.id,
          name: actor.name,
          profile_path: actor.profile_path,
          popularity: actor.popularity ?? 0,
          score: 0,
          featuredMovie: movie.title,
          featuredMovieId: movie.id,
          character: actor.character || "",
        };

        current.score += movieWeight / (index + 1);
        current.popularity = Math.max(current.popularity, actor.popularity ?? 0);
        actorScores.set(actor.id, current);
      });
    }

    return [...actorScores.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);
  } catch (error) {
    console.error("Error al traer actores de cartelera:", error);
    return getPopularPeople();
  }
}

export async function getMovie(idPeli) {
  try {
    return await tmdbGet(`/movie/${idPeli}`, {
      append_to_response: "videos,credits,release_dates,images",
      include_image_language: "es,null",
      language: "es-ES",
    });
  } catch (error) {
    console.error("Error al traer pelicula:", error);
    return {};
  }
}

export async function getTrailerKey(idPeli) {
  try {
    const languages = ["es-ES", "en-US", ""];

    for (const language of languages) {
      const data = await tmdbGet(`/movie/${idPeli}/videos`, {
        language,
      });
      const video = pickYoutubeVideo(data?.results);
      if (video?.key) return video.key;
    }

    return null;
  } catch (error) {
    console.error("Error al traer trailer:", error);
    return null;
  }
}

export async function searchMovies(query) {
  if (!query?.trim()) {
    return { results: [] };
  }

  try {
    const data = await tmdbGet("/search/movie", {
      query: query.trim(),
      language: "es-ES",
      include_adult: "false",
    });
    return {
      ...data,
      results: Array.isArray(data?.results) ? data.results : [],
    };
  } catch (error) {
    console.error("Error en la busqueda:", error);
    return { results: [] };
  }
}

function normalizeStoredMovie(movie) {
  const id = Number(movie?.id);
  if (!Number.isFinite(id)) return null;

  return {
    id,
    title: movie.title ?? "",
    overview: movie.overview ?? "",
    vote_average: movie.vote_average ?? 0,
    vote_count: movie.vote_count ?? 0,
    popularity: movie.popularity ?? 0,
    poster_path: movie.poster_path ?? null,
    backdrop_path: movie.backdrop_path ?? null,
    release_date: movie.release_date ?? "",
    genre_ids: Array.isArray(movie.genre_ids)
      ? movie.genre_ids.filter((genreId) => Number.isFinite(Number(genreId))).map(Number)
      : Array.isArray(movie.genres)
        ? movie.genres.map((genre) => Number(genre?.id)).filter(Number.isFinite)
        : [],
  };
}

function addRecommendation(scores, movie, weight, reason) {
  const normalized = normalizeStoredMovie(movie);
  if (!normalized?.id || !normalized.poster_path) return;

  const current = scores.get(normalized.id) ?? {
    ...normalized,
    score: 0,
    reasons: new Set(),
  };

  current.score += weight + (normalized.vote_average ?? 0) * 0.35 + (normalized.popularity ?? 0) * 0.02;
  if (reason) current.reasons.add(reason);
  scores.set(normalized.id, current);
}

function topGenreIds(seedMovies) {
  const counts = new Map();

  seedMovies.forEach(({ movie, weight }) => {
    normalizeStoredMovie(movie)?.genre_ids.forEach((genreId) => {
      counts.set(genreId, (counts.get(genreId) ?? 0) + weight);
    });
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genreId]) => genreId);
}

function recommendationPayload(movie) {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    vote_average: movie.vote_average,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date,
    genre_ids: movie.genre_ids,
    reason: [...(movie.reasons ?? [])][0] ?? "Coincide con tus gustos recientes.",
  };
}

export async function getRecommendedMoviesForUser(profile = {}, limit = 12) {
  const favorites = Array.isArray(profile.favorites) ? profile.favorites : [];
  const watchlist = Array.isArray(profile.watchlist) ? profile.watchlist : [];
  const viewedHistory = Array.isArray(profile.viewedHistory) ? profile.viewedHistory : [];

  const excludedIds = new Set(
    [...favorites, ...watchlist, ...viewedHistory]
      .map((movie) => Number(movie?.id))
      .filter(Number.isFinite)
  );

  const seedMovies = [
    ...favorites.slice(0, 8).map((movie, index) => ({ movie, weight: 8 - index * 0.4, label: "Basada en tus favoritos." })),
    ...watchlist.slice(0, 5).map((movie, index) => ({ movie, weight: 5 - index * 0.3, label: "Parecida a peliculas que guardaste." })),
    ...viewedHistory.slice(0, 8).map((movie, index) => ({ movie, weight: 4 - index * 0.2, label: "Segun tu historial reciente." })),
  ].filter(({ movie }) => Number.isFinite(Number(movie?.id)));

  try {
    const scores = new Map();

    for (const seed of seedMovies.slice(0, 6)) {
      const seedId = Number(seed.movie.id);
      const data = await tmdbGet(`/movie/${seedId}/recommendations`, {
        language: "es-ES",
        page: 1,
      });

      (data?.results ?? []).slice(0, 12).forEach((movie) => {
        if (!excludedIds.has(Number(movie?.id))) {
          addRecommendation(scores, movie, seed.weight, seed.label);
        }
      });
    }

    const genres = topGenreIds(seedMovies);
    if (genres.length > 0) {
      const data = await tmdbGet("/discover/movie", {
        include_adult: "false",
        include_video: "false",
        language: "es-ES",
        page: 1,
        region: "ES",
        sort_by: "popularity.desc",
        with_genres: genres.join(","),
      });

      (data?.results ?? []).slice(0, 18).forEach((movie) => {
        if (!excludedIds.has(Number(movie?.id))) {
          addRecommendation(scores, movie, 4, "Comparte generos que sueles elegir.");
        }
      });
    }

    if (scores.size === 0) {
      const data = await tmdbGet("/movie/popular", {
        language: "es-ES",
        page: 1,
        region: "ES",
      });

      (data?.results ?? []).slice(0, limit).forEach((movie) => {
        if (!excludedIds.has(Number(movie?.id))) {
          addRecommendation(scores, movie, 2, "Popular entre otros usuarios.");
        }
      });
    }

    return [...scores.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(recommendationPayload);
  } catch (error) {
    console.error("Error al generar recomendaciones:", error);
    return [];
  }
}

function watchContext(context = {}) {
  const hour = Number.isFinite(Number(context.hour)) ? Number(context.hour) : new Date().getHours();
  const day = Number.isFinite(Number(context.day)) ? Number(context.day) : new Date().getDay();
  const isWeekend = day === 0 || day === 6;

  if (hour >= 5 && hour < 12) {
    return {
      slot: "morning",
      label: "Plan ligero para empezar el dia",
      genres: isWeekend ? [12, 16, 35, 10751] : [35, 18, 10749],
      reason: isWeekend
        ? "Es una mañana de fin de semana: mejor algo entretenido, luminoso y facil de disfrutar."
        : "Para esta hora encaja una pelicula agil, sin exigir demasiado.",
    };
  }

  if (hour >= 12 && hour < 19) {
    return {
      slot: "afternoon",
      label: isWeekend ? "Sesion de tarde de fin de semana" : "Pelicula potente para la tarde",
      genres: isWeekend ? [12, 28, 878, 10751] : [28, 12, 878, 53],
      reason: isWeekend
        ? "La tarde del fin de semana pide una pelicula grande, visual y facil de compartir."
        : "Por la tarde funciona mejor algo con ritmo, aventura o tension.",
    };
  }

  if (hour >= 19 && hour < 24) {
    return {
      slot: "night",
      label: isWeekend ? "Noche de pelicula" : "Para cerrar el dia",
      genres: isWeekend ? [53, 80, 28, 878] : [18, 53, 9648, 878],
      reason: isWeekend
        ? "Es noche de fin de semana: toca una recomendacion con mas intensidad."
        : "De noche encaja una historia mas inmersiva, con drama, misterio o tension.",
    };
  }

  return {
    slot: "late",
    label: "Para ver de madrugada",
    genres: [9648, 53, 27, 878],
    reason: "A esta hora va mejor algo atmosferico, corto de decidir y con misterio.",
  };
}

function contextGenreScore(movie, genres) {
  const movieGenres = new Set(normalizeStoredMovie(movie)?.genre_ids ?? []);
  return genres.reduce((score, genreId) => score + (movieGenres.has(genreId) ? 4 : 0), 0);
}

function deterministicPick(items, context = {}) {
  if (!items.length) return null;

  const hour = Number(context.hour) || 0;
  const day = Number(context.day) || 0;
  const variant = Number(context.variant) || 0;
  const dateKey = String(context.date ?? "")
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  const index = Math.abs(dateKey + hour * 7 + day * 11 + variant * 5) % Math.min(items.length, 8);

  return items[index];
}

export async function getWatchTodayMovie(profile = {}, context = {}) {
  const ctx = watchContext(context);
  const favorites = Array.isArray(profile.favorites) ? profile.favorites : [];
  const watchlist = Array.isArray(profile.watchlist) ? profile.watchlist : [];
  const viewedHistory = Array.isArray(profile.viewedHistory) ? profile.viewedHistory : [];
  const hasSignals = favorites.length + watchlist.length + viewedHistory.length > 0;
  const excludedIds = new Set(
    [...favorites, ...watchlist, ...viewedHistory]
      .map((movie) => Number(movie?.id))
      .filter(Number.isFinite)
  );

  try {
    if (hasSignals) {
      const personalized = await getRecommendedMoviesForUser(profile, 20);
      const personalizedMatches = personalized
        .filter((movie) => !excludedIds.has(Number(movie?.id)) && movie.poster_path)
        .map((movie) => ({
          ...movie,
          score:
            contextGenreScore(movie, ctx.genres) +
            (movie.vote_average ?? 0) * 0.7 +
            (movie.reason?.includes("favoritos") ? 3 : 0),
        }))
        .sort((a, b) => b.score - a.score);

      const pickedPersonalized = deterministicPick(personalizedMatches.slice(0, 8), context);
      if (pickedPersonalized) {
        return {
          ...recommendationPayload({
            ...pickedPersonalized,
            reasons: new Set([`${ctx.reason} Ademas, encaja con tu historial y favoritos.`]),
          }),
          context_label: ctx.label,
        };
      }
    }

    const page = ((Number(context.hour) || 0) + (Number(context.day) || 0)) % 4 + 1;
    const data = await tmdbGet("/discover/movie", {
      include_adult: "false",
      include_video: "false",
      language: "es-ES",
      page,
      region: "ES",
      sort_by: ctx.slot === "late" ? "vote_average.desc" : "popularity.desc",
      "vote_count.gte": ctx.slot === "late" ? 300 : 600,
      with_genres: ctx.genres.join("|"),
    });

    const candidates = (data?.results ?? [])
      .filter((movie) => !excludedIds.has(Number(movie?.id)) && movie.poster_path && movie.backdrop_path)
      .map((movie) => ({
        ...normalizeStoredMovie(movie),
        score: contextGenreScore(movie, ctx.genres) + (movie.vote_average ?? 0) * 0.8 + (movie.popularity ?? 0) * 0.02,
      }))
      .sort((a, b) => b.score - a.score);

    const movie = deterministicPick(candidates.slice(0, 10), context);
    return movie
      ? {
          ...recommendationPayload({ ...movie, reasons: new Set([ctx.reason]) }),
          context_label: ctx.label,
        }
      : null;
  } catch (error) {
    console.error("Error al elegir pelicula para hoy:", error);
    return null;
  }
}

export async function getActor(idActor) {
  try {
    return await tmdbGet(`/person/${idActor}`, {
      append_to_response: "movie_credits,images,combined_credits",
      include_image_language: "es,null",
      language: "es-ES",
    });
  } catch (error) {
    console.error("Error al traer actor:", error);
    return {};
  }
}
