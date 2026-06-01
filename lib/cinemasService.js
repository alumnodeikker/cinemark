// Servicio de cines cercanos
// Usa una combinación de APIs públicas y datos mock

const CINE_MOCK_DATABASE = {
  ES: [
    {
      id: "yelmo-1",
      name: "Yelmo Cines Boulevard",
      address: "Avenida Diagonal, 500",
      city: "Barcelona",
      latitude: 41.3923,
      longitude: 2.1129,
      phone: "+34 93 XXX XXXX",
      website: "https://www.yelmo.es",
      formats: ["2D", "3D", "IMAX", "VOSE"],
      showtimes: ["16:30", "19:00", "21:45", "00:15"],
    },
    {
      id: "yelmo-2",
      name: "Yelmo Cines Castellana",
      address: "Paseo de la Castellana, 222",
      city: "Madrid",
      latitude: 40.4523,
      longitude: -3.6139,
      phone: "+34 91 XXX XXXX",
      website: "https://www.yelmo.es",
      formats: ["2D", "3D", "IMAX", "Dolby Atmos"],
      showtimes: ["17:00", "19:30", "22:00"],
    },
    {
      id: "odeon-1",
      name: "Odeon Cinemas Madrid",
      address: "Calle Mayor, 1",
      city: "Madrid",
      latitude: 40.4168,
      longitude: -3.7038,
      phone: "+34 91 XXX XXXX",
      website: "https://www.odeon.es",
      formats: ["2D", "3D"],
      showtimes: ["15:30", "18:00", "20:30"],
    },
    {
      id: "kinepolis-1",
      name: "Kinépolis Valencia",
      address: "Avenida Tres Cruces, 48",
      city: "Valencia",
      latitude: 39.4699,
      longitude: -0.3763,
      phone: "+34 96 XXX XXXX",
      website: "https://www.kinepolis.es",
      formats: ["2D", "3D", "4DX"],
      showtimes: ["16:00", "18:45", "21:15"],
    },
  ],
  FR: [
    {
      id: "pathe-1",
      name: "Pathé Beaugrenelle",
      address: "111 rue Linois",
      city: "París",
      latitude: 48.844,
      longitude: 2.287,
      phone: "+33 1 XXXX XXXX",
      website: "https://www.cinemaspathe.com",
      formats: ["2D", "3D", "IMAX", "Dolby Atmos"],
      showtimes: ["16:30", "19:00", "21:30"],
    },
    {
      id: "ugc-1",
      name: "UGC Ciné Cité",
      address: "30 avenue des Champs-Élysées",
      city: "París",
      latitude: 48.8697,
      longitude: 2.3077,
      phone: "+33 1 XXXX XXXX",
      website: "https://www.ugccinemas.fr",
      formats: ["2D", "3D", "IMAX"],
      showtimes: ["17:00", "19:30", "22:00"],
    },
  ],
  IT: [
    {
      id: "cineplex-1",
      name: "Cineplex Roma",
      address: "Via Piemonte, 57",
      city: "Roma",
      latitude: 41.9161,
      longitude: 12.5137,
      phone: "+39 06 XXXX XXXX",
      website: "https://www.cineplex.it",
      formats: ["2D", "3D"],
      showtimes: ["17:00", "19:30", "21:45"],
    },
  ],
  MX: [
    {
      id: "cinepolis-1",
      name: "Cinépolis Premium",
      address: "Avenida Paseo de la Reforma, 222",
      city: "Ciudad de México",
      latitude: 19.4271,
      longitude: -99.1953,
      phone: "+52 55 XXXX XXXX",
      website: "https://www.cinepolis.com",
      formats: ["2D", "3D", "IMAX", "4DX", "Premium"],
      showtimes: ["16:00", "18:30", "21:00", "23:30"],
    },
  ],
};

/**
 * Obtener cines cercanos a una ubicación
 * @param {number} latitude - Latitud del usuario
 * @param {number} longitude - Longitud del usuario
 * @param {string} countryCode - Código de país (ej: 'ES', 'FR')
 * @param {number} radiusKm - Radio de búsqueda en km (default: 15)
 */
export async function getNearbyCinemas(latitude, longitude, countryCode, radiusKm = 15) {
  try {
    // Obtener cines del país (mock data)
    const countryCinemas = CINE_MOCK_DATABASE[countryCode] || [];

    // En producción, aquí podrías llamar a:
    // - Google Places API
    // - Overpass API (OpenStreetMap)
    // - API local de cadenas de cines

    // Calcular distancia a cada cine
    const cinemasDist = countryCinemas.map((cinema) => {
      const distance = calculateDistance(latitude, longitude, cinema.latitude, cinema.longitude);
      return {
        ...cinema,
        distance,
      };
    });

    // Filtrar por radio y ordenar por distancia
    const nearby = cinemasDist
      .filter((c) => c.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10); // Máximo 10 cines

    return {
      success: true,
      data: nearby,
      radius: radiusKm,
      count: nearby.length,
    };
  } catch (error) {
    console.error("Error obteniendo cines cercanos:", error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
}

/**
 * Obtener detalles de un cine específico
 */
export async function getCinemaDetails(cinemaId, countryCode) {
  try {
    const cinemas = CINE_MOCK_DATABASE[countryCode] || [];
    const cinema = cinemas.find((c) => c.id === cinemaId);

    if (!cinema) {
      return {
        success: false,
        error: "Cine no encontrado",
      };
    }

    return {
      success: true,
      data: cinema,
    };
  } catch (error) {
    console.error("Error obteniendo detalles del cine:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Calcular distancia entre dos puntos (fórmula Haversine)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
