const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const RAW_TMDB_SECRET =
  process.env.TMDB_ACCESS_TOKEN ||
  process.env.TMDB_API_KEY ||
  process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN ||
  process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_SECRET = RAW_TMDB_SECRET?.trim() ?? "";
const IS_BEARER_TOKEN =
  TMDB_SECRET.split(".").length === 3 && TMDB_SECRET.length > 40;

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    ...(IS_BEARER_TOKEN && TMDB_SECRET
      ? { Authorization: `Bearer ${TMDB_SECRET}` }
      : {}),
  },
};

async function tmdbGet(path, query = {}) {
  if (!TMDB_SECRET) {
    throw new Error(
      "TMDB auth no configurada. Define TMDB_ACCESS_TOKEN (Bearer) o TMDB_API_KEY."
    );
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  if (!IS_BEARER_TOKEN) {
    url.searchParams.set("api_key", TMDB_SECRET);
  }

  const res = await fetch(url, options);
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

export async function traerPeliculas() {
  try {
    const datos = await tmdbGet("/movie/popular", { language: "es-ES" });
    return Array.isArray(datos?.results) ? datos.results : [];
  } catch (error) {
    console.error("Error al traer peliculas:", error);
    return [];
  }
}

export async function fetchPeli(idPeli) {
  try {
    return await tmdbGet(`/movie/${idPeli}`, {
      append_to_response: "videos,credits,release_dates",
      language: "es-ES",
    });
  } catch (error) {
    console.error("Error al traer pelicula:", error);
    return {};
  }
}

export async function fetchTrailerKey(idPeli) {
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

export async function fetchBusqueda(query) {
  if (!query?.trim()) {
    return { results: [] };
  }

  try {
    return await tmdbGet("/search/movie", {
      query: query.trim(),
      language: "es-ES",
    });
  } catch (error) {
    console.error("Error en la busqueda:", error);
    return { results: [] };
  }
}
