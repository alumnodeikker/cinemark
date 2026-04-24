import "server-only";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

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
      append_to_response: "videos,credits,release_dates,images",
      include_image_language: "es,null",
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
