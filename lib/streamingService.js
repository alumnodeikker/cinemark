// Servicio de disponibilidad real de streaming por país usando TMDB Watch Providers.

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

const ACCESS_LABELS = {
  flatrate: "subscription",
  rent: "rent",
  buy: "buy",
};

const PROVIDER_LINKS = [
  {
    match: /netflix/i,
    build: (query) => `https://www.netflix.com/search?q=${query}`,
  },
  {
    match: /prime video|amazon/i,
    build: (query) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${query}`,
  },
  {
    match: /disney/i,
    build: (query) => `https://www.disneyplus.com/search?q=${query}`,
  },
  {
    match: /max|hbo/i,
    build: (query) => `https://www.max.com/search?q=${query}`,
  },
  {
    match: /apple/i,
    build: (query) => `https://tv.apple.com/search?term=${query}`,
  },
  {
    match: /movistar/i,
    build: (query) => `https://ver.movistarplus.es/busqueda?search=${query}`,
  },
  {
    match: /filmin/i,
    build: (query) => `https://www.filmin.es/buscar?query=${query}`,
  },
  {
    match: /rakuten/i,
    build: (query) => `https://rakuten.tv/es/search?q=${query}`,
  },
  {
    match: /google play/i,
    build: (query) => `https://play.google.com/store/search?q=${query}&c=movies`,
  },
  {
    match: /youtube/i,
    build: (query) => `https://www.youtube.com/results?search_query=${query}%20pelicula`,
  },
  {
    match: /microsoft/i,
    build: (query) => `https://www.microsoft.com/es-es/search/shop/movies?q=${query}`,
  },
];

function buildTmdbHeaders() {
  const token = process.env.TMDB_ACCESS_TOKEN;

  if (!token) {
    throw new Error("Falta TMDB_ACCESS_TOKEN para consultar proveedores de streaming.");
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
  const response = await fetch(url, {
    headers: buildTmdbHeaders(),
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`TMDB Watch Providers error: ${response.status}`);
  }

  return response.json();
}

function buildProviderUrl(providerName, movieTitle, fallbackLink) {
  const title = String(movieTitle || "").trim();
  const query = encodeURIComponent(title);
  const provider = PROVIDER_LINKS.find((item) => item.match.test(providerName || ""));

  if (provider && query) {
    return provider.build(query);
  }

  if (fallbackLink && !fallbackLink.includes("themoviedb.org")) {
    return fallbackLink;
  }

  return null;
}

function normalizeProvider(provider, accessType, link, movieTitle) {
  return {
    provider_id: `${provider.provider_id}-${accessType}`,
    tmdb_provider_id: provider.provider_id,
    provider_name: provider.provider_name,
    logo_path: provider.logo_path ? `${TMDB_IMAGE_BASE_URL}${provider.logo_path}` : null,
    display_priority: provider.display_priority ?? 999,
    access_type: ACCESS_LABELS[accessType] || accessType,
    url: buildProviderUrl(provider.provider_name, movieTitle, link),
  };
}

/**
 * Obtener disponibilidad real de streaming para una película por país.
 * Fuente: TMDB Watch Providers. La disponibilidad puede incluir suscripción,
 * alquiler y compra según lo que TMDB reciba de sus proveedores.
 */
export async function getStreamingAvailability(movieId, countryCode = "ES", movieTitle = "") {
  try {
    const data = await tmdbGet(`/movie/${movieId}/watch/providers`);
    const country = String(countryCode || "ES").toUpperCase();
    const entry = data?.results?.[country];

    if (!entry) {
      return {
        success: true,
        data: [],
        countryCode: country,
        source: "TMDB Watch Providers",
        message: "No disponible en streaming en tu país",
      };
    }

    const providers = ["flatrate", "rent", "buy"].flatMap((type) =>
      Array.isArray(entry[type])
        ? entry[type].map((provider) => normalizeProvider(provider, type, entry.link, movieTitle))
        : []
    );

    providers.sort((a, b) => a.display_priority - b.display_priority);

    return {
      success: true,
      data: providers,
      countryCode: country,
      source: "TMDB Watch Providers",
      link: entry.link,
    };
  } catch (error) {
    console.error("Error obteniendo disponibilidad de streaming:", error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
}

export async function getProvidersInCountry(countryCode = "ES") {
  try {
    const data = await tmdbGet("/watch/providers/movie", {
      language: "es-ES",
      watch_region: String(countryCode || "ES").toUpperCase(),
    });

    return Array.isArray(data?.results)
      ? data.results.map((provider) => ({
          name: provider.provider_name,
          logo: provider.logo_path ? `${TMDB_IMAGE_BASE_URL}${provider.logo_path}` : null,
          id: provider.provider_id,
        }))
      : [];
  } catch {
    return [];
  }
}

export function getMovieAccessInfo(releaseDate, endDate, status, hasStreaming = false) {
  const today = new Date();
  const release = new Date(releaseDate);
  const end = endDate ? new Date(endDate) : null;

  if (hasStreaming) {
    return {
      status: "streaming",
      message: "Disponible en streaming",
      canBuyTickets: false,
      streamingAvailable: true,
    };
  }

  if (status === "Upcoming" || release > today) {
    return {
      status: "upcoming",
      message: "Próximo estreno",
      daysUntil: Math.ceil((release - today) / (1000 * 60 * 60 * 24)),
      canBuyTickets: false,
    };
  }

  if (end && today > end) {
    return {
      status: "ended",
      message: "Finalizada en cines",
      canBuyTickets: false,
      streamingAvailable: false,
    };
  }

  return {
    status: "theatrical",
    message: "En cartelera",
    canBuyTickets: true,
    daysLeft: end ? Math.ceil((end - today) / (1000 * 60 * 60 * 24)) : null,
  };
}
