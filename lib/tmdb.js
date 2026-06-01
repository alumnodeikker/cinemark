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

export async function getUpcomingMoviesSoon(daysAhead = 15) {
  try {
    const datos = await tmdbGet("/discover/movie", {
      "primary_release_date.gte": addDaysIso(0),
      "primary_release_date.lte": addDaysIso(daysAhead),
      include_adult: "false",
      include_video: "false",
      language: "es-ES",
      page: 1,
      region: "ES",
      sort_by: "primary_release_date.asc",
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
    const data = await tmdbGet(`/movie/${idPeli}/videos`, {
      language: "es-ES",
    });
    const video = pickYoutubeVideo(data?.results);
    return video?.key ?? null;
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
      results: filterAllowedReleases(data?.results),
    };
  } catch (error) {
    console.error("Error en la busqueda:", error);
    return { results: [] };
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
