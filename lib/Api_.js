const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_TOKEN =
  process.env.TMDB_ACCESS_TOKEN ||
  process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN ||
  process.env.NEXT_PUBLIC_TMDB_API_KEY;

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    ...(TMDB_TOKEN ? { Authorization: `Bearer ${TMDB_TOKEN}` } : {}),
  },
};

async function tmdbGet(path, query = {}) {
  const url = new URL(`${TMDB_BASE_URL}${path}`);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const res = await fetch(url, options);
  if (!res.ok) {
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
