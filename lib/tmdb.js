import "server-only";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const RELEASE_YEAR_START = 2026;
const RELEASE_YEAR_END = 2027;
const RELEASE_DATE_START = `${RELEASE_YEAR_START}-01-01`;
const RELEASE_DATE_END = `${RELEASE_YEAR_END}-12-31`;

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function releaseYear(movie) {
  const year = Number(movie?.release_date?.split("-")?.[0]);
  return Number.isFinite(year) ? year : null;
}

function isAllowedRelease(movie) {
  const year = releaseYear(movie);
  return year != null && year >= RELEASE_YEAR_START && year <= RELEASE_YEAR_END;
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
    const datos = await tmdbGet("/discover/movie", {
      "primary_release_date.gte": RELEASE_DATE_START,
      "primary_release_date.lte": RELEASE_DATE_END,
      include_adult: "false",
      include_video: "false",
      language: "es-ES",
      page: 1,
      region: "ES",
      sort_by: "popularity.desc",
      with_release_type: "2|3",
    });
    return filterAllowedReleases(datos?.results);
  } catch (error) {
    console.error("Error al traer peliculas:", error);
    return [];
  }
}

export async function getNowPlayingMovies() {
  try {
    const datos = await tmdbGet("/discover/movie", {
      "primary_release_date.gte": RELEASE_DATE_START,
      "primary_release_date.lte": RELEASE_DATE_END,
      include_adult: "false",
      include_video: "false",
      language: "es-ES",
      page: 1,
      region: "ES",
      sort_by: "primary_release_date.desc",
      with_release_type: "2|3",
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
      "primary_release_date.gte": RELEASE_DATE_START,
      "primary_release_date.lte": RELEASE_DATE_END,
      include_adult: "false",
      include_video: "false",
      language: "es-ES",
      page: 1,
      region: "ES",
      sort_by: "vote_count.desc",
      with_release_type: "2|3",
    });
    const lista = filterAllowedReleases(datos?.results);
    return lista.slice(0, 10);
  } catch (error) {
    console.error("Error al traer top semanal:", error);
    return [];
  }
}

export async function getUpcomingMoviesWithTrailers() {
  try {
    const datos = await tmdbGet("/discover/movie", {
      "primary_release_date.gte": todayIsoDate(),
      "primary_release_date.lte": RELEASE_DATE_END,
      include_adult: "false",
      include_video: "false",
      language: "es-ES",
      page: 1,
      region: "ES",
      sort_by: "primary_release_date.asc",
      with_release_type: "2|3",
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

export async function getPopularPeople() {
  try {
    const datos = await tmdbGet("/person/popular", { language: "es-ES", page: 1 });
    return Array.isArray(datos?.results) ? datos.results.slice(0, 15) : [];
  } catch (error) {
    console.error("Error al traer celebridades populares:", error);
    return [];
  }
}

export async function getMovie(idPeli) {
  try {
    const movie = await tmdbGet(`/movie/${idPeli}`, {
      append_to_response: "videos,credits,release_dates,images",
      include_image_language: "es,null",
      language: "es-ES",
    });
    return isAllowedRelease(movie) ? movie : {};
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
      primary_release_year: RELEASE_YEAR_START,
    });
    const results2026 = filterAllowedReleases(data?.results);

    if (RELEASE_YEAR_END === RELEASE_YEAR_START) {
      return { ...data, results: results2026 };
    }

    const nextYearData = await tmdbGet("/search/movie", {
      query: query.trim(),
      language: "es-ES",
      include_adult: "false",
      primary_release_year: RELEASE_YEAR_END,
    });
    const merged = [...results2026, ...filterAllowedReleases(nextYearData?.results)];
    const unique = Array.from(new Map(merged.map((movie) => [movie.id, movie])).values());

    return { ...data, results: unique };
  } catch (error) {
    console.error("Error en la busqueda:", error);
    return { results: [] };
  }
}

export async function getActor(idActor) {
  try {
    const actor = await tmdbGet(`/person/${idActor}`, {
      append_to_response: "movie_credits,images,combined_credits",
      include_image_language: "es,null",
      language: "es-ES",
    });

    return {
      ...actor,
      movie_credits: {
        ...actor.movie_credits,
        cast: filterAllowedReleases(actor.movie_credits?.cast),
        crew: filterAllowedReleases(actor.movie_credits?.crew),
      },
      combined_credits: {
        ...actor.combined_credits,
        cast: filterAllowedReleases(actor.combined_credits?.cast),
        crew: filterAllowedReleases(actor.combined_credits?.crew),
      },
    };
  } catch (error) {
    console.error("Error al traer actor:", error);
    return {};
  }
}
