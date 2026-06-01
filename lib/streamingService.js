// Servicio de disponibilidad de streaming por país
// Integración simulada con JustWatch API

const STREAMING_PROVIDERS = {
  ES: {
    // España
    netflix: {
      name: "Netflix",
      logo: "https://image.tmdb.org/t/p/original/jwRr76DsoyWAGJy7KwIAJ5sDXZm.png",
      url: "https://www.netflix.com/es/",
      color: "#E50914",
    },
    "amazon-prime": {
      name: "Prime Video",
      logo: "https://image.tmdb.org/t/p/original/6uhIqwVyIE1e6W2nrub5haAVAGc.png",
      url: "https://www.primevideo.com/?language=es",
      color: "#00A8E1",
    },
    disney: {
      name: "Disney+",
      logo: "https://image.tmdb.org/t/p/original/7rwgEs15tFEzB8O2kT47So2jDZG.png",
      url: "https://www.disneyplus.com/es",
      color: "#113CCF",
    },
    "apple-tv": {
      name: "Apple TV+",
      logo: "https://image.tmdb.org/t/p/original/g8ghVHUUfjJTvRX4WNO5mobXoXm.png",
      url: "https://tv.apple.com/es",
      color: "#000000",
    },
    movistarplus: {
      name: "Movistar Plus+",
      logo: "https://image.tmdb.org/t/p/original/fZcI8BjP6BkALaWIvT8g7k0T8gZ.png",
      url: "https://www.movistarplus.es",
      color: "#004B87",
    },
    hbo: {
      name: "Max (HBO Max)",
      logo: "https://image.tmdb.org/t/p/original/1g0dhYtq4Cm78SQSg1C3jccj4qL.png",
      url: "https://www.max.com/es",
      color: "#6A1B9A",
    },
  },
  FR: {
    // Francia
    netflix: {
      name: "Netflix",
      logo: "https://image.tmdb.org/t/p/original/jwRr76DsoyWAGJy7KwIAJ5sDXZm.png",
      url: "https://www.netflix.com/fr/",
      color: "#E50914",
    },
    "amazon-prime": {
      name: "Prime Video",
      logo: "https://image.tmdb.org/t/p/original/6uhIqwVyIE1e6W2nrub5haAVAGc.png",
      url: "https://www.primevideo.com/?language=fr",
      color: "#00A8E1",
    },
    disney: {
      name: "Disney+",
      logo: "https://image.tmdb.org/t/p/original/7rwgEs15tFEzB8O2kT47So2jDZG.png",
      url: "https://www.disneyplus.com/fr",
      color: "#113CCF",
    },
  },
  IT: {
    // Italia
    netflix: {
      name: "Netflix",
      logo: "https://image.tmdb.org/t/p/original/jwRr76DsoyWAGJy7KwIAJ5sDXZm.png",
      url: "https://www.netflix.com/it/",
      color: "#E50914",
    },
    "amazon-prime": {
      name: "Prime Video",
      logo: "https://image.tmdb.org/t/p/original/6uhIqwVyIE1e6W2nrub5haAVAGc.png",
      url: "https://www.primevideo.com/?language=it",
      color: "#00A8E1",
    },
  },
  MX: {
    // México
    netflix: {
      name: "Netflix",
      logo: "https://image.tmdb.org/t/p/original/jwRr76DsoyWAGJy7KwIAJ5sDXZm.png",
      url: "https://www.netflix.com/mx/",
      color: "#E50914",
    },
    "amazon-prime": {
      name: "Prime Video",
      logo: "https://image.tmdb.org/t/p/original/6uhIqwVyIE1e6W2nrub5haAVAGc.png",
      url: "https://www.primevideo.com/?language=es_MX",
      color: "#00A8E1",
    },
    disney: {
      name: "Disney+",
      logo: "https://image.tmdb.org/t/p/original/7rwgEs15tFEzB8O2kT47So2jDZG.png",
      url: "https://www.disneyplus.com/es-mx",
      color: "#113CCF",
    },
  },
};

// Base de datos simulada de disponibilidad de películas
const MOVIE_STREAMING_DB = {
  // movieId: { countryCode: [{ provider: 'netflix', type: 'subscription', ... }] }
};

/**
 * Obtener disponibilidad de streaming para una película
 * En producción, esto vendría de JustWatch API
 */
export async function getStreamingAvailability(movieId, countryCode) {
  try {
    // Simulación: Generar disponibilidad aleatoria
    const availableProviders = simulateStreamingData(movieId, countryCode);

    if (availableProviders.length === 0) {
      return {
        success: true,
        data: [],
        message: "No disponible en streaming en tu país",
      };
    }

    return {
      success: true,
      data: availableProviders,
      countryCode,
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

/**
 * Simular datos de streaming (en producción usar API real)
 */
function simulateStreamingData(movieId, countryCode) {
  const providers = STREAMING_PROVIDERS[countryCode] || STREAMING_PROVIDERS.ES;
  const providerKeys = Object.keys(providers);

  if (providerKeys.length === 0) return [];

  // Seleccionar 1-3 proveedores aleatorios
  const count = Math.floor(Math.random() * 3) + 1;
  const selected = [];

  for (let i = 0; i < count && selected.length < providerKeys.length; i++) {
    const randomKey = providerKeys[Math.floor(Math.random() * providerKeys.length)];
    if (!selected.some((s) => s.provider_id === randomKey)) {
      const types = ["subscription", "rent", "buy"];
      const randomType = types[Math.floor(Math.random() * types.length)];

      selected.push({
        provider_id: randomKey,
        provider_name: providers[randomKey].name,
        logo_path: providers[randomKey].logo,
        display_priority: selected.length + 1,
        access_type: randomType,
        url: providers[randomKey].url,
        color: providers[randomKey].color,
      });
    }
  }

  return selected;
}

/**
 * Obtener proveedores disponibles en un país
 */
export function getProvidersInCountry(countryCode) {
  const providers = STREAMING_PROVIDERS[countryCode] || STREAMING_PROVIDERS.ES;
  return Object.values(providers).map((provider) => ({
    name: provider.name,
    logo: provider.logo,
    url: provider.url,
    color: provider.color,
  }));
}

/**
 * Obtener información de acceso para una película
 * Retorna estado: 'theatrical', 'upcomming', 'streaming', 'ended'
 */
export function getMovieAccessInfo(releaseDate, endDate, status) {
  const today = new Date();
  const release = new Date(releaseDate);
  const end = endDate ? new Date(endDate) : null;

  if (status === "Upcoming") {
    return {
      status: "upcoming",
      message: "Próximo estreno",
      canBuyTickets: false,
    };
  }

  if (release > today) {
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
      streamingAvailable: true,
    };
  }

  return {
    status: "theatrical",
    message: "En cartelera",
    canBuyTickets: true,
    daysLeft: end ? Math.ceil((end - today) / (1000 * 60 * 60 * 24)) : null,
  };
}
