// Servicio real de cines cercanos usando OpenStreetMap Overpass.

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const COUNTRY_CINEMA_SEARCH = {
  ES: "cine",
  FR: "cinema",
  IT: "cinema",
  MX: "cine",
  US: "cinema",
  GB: "cinema",
};

const CHAIN_URLS = [
  { match: /yelmo/i, url: "https://www.yelmocines.es" },
  { match: /kinepolis|kin[eé]polis/i, url: "https://kinepolis.es" },
  { match: /odeon/i, url: "https://www.odeon.es" },
  { match: /cinesa/i, url: "https://www.cinesa.es" },
  { match: /mk2/i, url: "https://www.mk2.es" },
  { match: /phenomena/i, url: "https://www.phenomena-experience.com" },
  { match: /pathe|path[eé]/i, url: "https://www.pathe.fr" },
  { match: /ugc/i, url: "https://www.ugc.fr" },
  { match: /cin[eé]polis/i, url: "https://cinepolis.com" },
];

const REGIONAL_CINEMA_LINKS = {
  ES: [
    {
      id: "yelmo-es",
      name: "Yelmo Cines",
      address: "Cartelera oficial en España",
      city: "España",
      distance: null,
      website: "https://www.yelmocines.es/cartelera",
      formats: ["2D", "3D", "IMAX", "VOSE"],
      showtimes: [],
      showtimesSource: "official_site_required",
    },
    {
      id: "cinesa-es",
      name: "Cinesa",
      address: "Cartelera oficial en España",
      city: "España",
      distance: null,
      website: "https://www.cinesa.es/cines/",
      formats: ["2D", "3D", "IMAX", "VOSE"],
      showtimes: [],
      showtimesSource: "official_site_required",
    },
    {
      id: "kinepolis-es",
      name: "Kinépolis",
      address: "Cartelera oficial en España",
      city: "España",
      distance: null,
      website: "https://kinepolis.es/cines",
      formats: ["2D", "3D", "IMAX", "4DX"],
      showtimes: [],
      showtimesSource: "official_site_required",
    },
    {
      id: "entradas-es",
      name: "Entradas.com",
      address: "Buscador de cines y entradas",
      city: "España",
      distance: null,
      website: "https://www.entradas.com/cine/",
      formats: ["Cartelera", "Entradas"],
      showtimes: [],
      showtimesSource: "official_site_required",
    },
  ],
  FR: [
    {
      id: "pathe-fr",
      name: "Pathé",
      address: "Cartelera oficial en Francia",
      city: "Francia",
      distance: null,
      website: "https://www.pathe.fr/cinemas",
      formats: ["2D", "3D", "IMAX", "Dolby"],
      showtimes: [],
      showtimesSource: "official_site_required",
    },
    {
      id: "ugc-fr",
      name: "UGC",
      address: "Cartelera oficial en Francia",
      city: "Francia",
      distance: null,
      website: "https://www.ugc.fr/cinemas.html",
      formats: ["2D", "3D", "VO"],
      showtimes: [],
      showtimesSource: "official_site_required",
    },
  ],
  MX: [
    {
      id: "cinepolis-mx",
      name: "Cinépolis",
      address: "Cartelera oficial en México",
      city: "México",
      distance: null,
      website: "https://cinepolis.com/cartelera",
      formats: ["2D", "3D", "IMAX", "4DX"],
      showtimes: [],
      showtimesSource: "official_site_required",
    },
    {
      id: "cinemex-mx",
      name: "Cinemex",
      address: "Cartelera oficial en México",
      city: "México",
      distance: null,
      website: "https://cinemex.com/cartelera",
      formats: ["2D", "3D", "Premium"],
      showtimes: [],
      showtimesSource: "official_site_required",
    },
  ],
};

const REGION_CINEMA_LINKS = [
  {
    match: /vitoria|gasteiz|alava|álava|euskadi|vasco|basque/i,
    links: [
      {
        id: "yelmo-vitoria",
        name: "Yelmo Cines Vitoria",
        address: "Cartelera oficial para Vitoria-Gasteiz",
        city: "Vitoria-Gasteiz",
        distance: null,
        website: "https://www.yelmocines.es/cartelera",
        formats: ["2D", "3D", "VOSE"],
        showtimes: [],
        showtimesSource: "official_site_required",
      },
      {
        id: "florida-vitoria",
        name: "Cines Florida",
        address: "Cartelera local de Vitoria-Gasteiz",
        city: "Vitoria-Gasteiz",
        distance: null,
        website: "https://www.cinesflorida.com/",
        formats: ["2D", "VOSE"],
        showtimes: [],
        showtimesSource: "official_site_required",
      },
    ],
  },
];

function buildOverpassQuery(latitude, longitude, radiusMeters) {
  return `
    [out:json][timeout:20];
    (
      node["amenity"="cinema"](around:${radiusMeters},${latitude},${longitude});
      way["amenity"="cinema"](around:${radiusMeters},${latitude},${longitude});
      relation["amenity"="cinema"](around:${radiusMeters},${latitude},${longitude});
    );
    out center tags;
  `;
}

async function fetchOverpass(query) {
  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": "Cinemark local movie app",
        },
        body: new URLSearchParams({ data: query }),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Overpass ${response.status}`);
      }

      return response.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No se pudo consultar Overpass");
}

function resolveOfficialUrl(tags = {}, name = "") {
  const taggedUrl = tags.website || tags["contact:website"] || tags.url;
  if (taggedUrl) {
    return taggedUrl.startsWith("http") ? taggedUrl : `https://${taggedUrl}`;
  }

  const known = CHAIN_URLS.find((chain) => chain.match.test(name));
  return known?.url || null;
}

function buildAddress(tags = {}) {
  const street = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ");
  const city = tags["addr:city"] || tags["addr:town"] || tags["addr:municipality"] || "";
  const postcode = tags["addr:postcode"] || "";
  const parts = [street, postcode, city].filter(Boolean);
  return parts.length ? parts.join(", ") : "Dirección no disponible";
}

function inferFormats(tags = {}, name = "") {
  const source = `${name} ${Object.values(tags).join(" ")}`;
  const formats = ["2D"];

  if (/3d/i.test(source)) formats.push("3D");
  if (/imax/i.test(source)) formats.push("IMAX");
  if (/vose|original|version original/i.test(source)) formats.push("VOSE");
  if (/dolby|atmos/i.test(source)) formats.push("Dolby");
  if (/4dx/i.test(source)) formats.push("4DX");

  return [...new Set(formats)];
}

function getElementCoordinates(element) {
  return {
    latitude: element.lat ?? element.center?.lat,
    longitude: element.lon ?? element.center?.lon,
  };
}

function normalizeCinema(element, userLatitude, userLongitude, countryCode) {
  const tags = element.tags || {};
  const { latitude, longitude } = getElementCoordinates(element);
  const name = tags.name || COUNTRY_CINEMA_SEARCH[countryCode] || "Cine";

  return {
    id: String(element.id),
    name,
    address: buildAddress(tags),
    city: tags["addr:city"] || tags["addr:town"] || tags["addr:municipality"] || "",
    latitude,
    longitude,
    distance: calculateDistance(userLatitude, userLongitude, latitude, longitude),
    website: resolveOfficialUrl(tags, name),
    formats: inferFormats(tags, name),
    showtimes: [],
    showtimesSource: "official_site_required",
  };
}

/**
 * Obtener cines cercanos a una ubicación real.
 * Los horarios por película no están en OpenStreetMap; deben venir de APIs oficiales
 * de exhibidores o agregadores. Por eso se devuelve showtimes vacío y enlace oficial.
 */
export async function getNearbyCinemas(latitude, longitude, countryCode, radiusKm = 15) {
  try {
    const radiusMeters = Math.max(1, Math.min(Number(radiusKm) || 15, 50)) * 1000;
    const query = buildOverpassQuery(latitude, longitude, radiusMeters);
    const data = await fetchOverpass(query);
    const elements = Array.isArray(data?.elements) ? data.elements : [];

    const nearby = elements
      .map((element) => normalizeCinema(element, latitude, longitude, countryCode))
      .filter((cinema) => Number.isFinite(cinema.latitude) && Number.isFinite(cinema.longitude))
      .filter((cinema) => cinema.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    return {
      success: true,
      data: nearby,
      radius: radiusKm,
      count: nearby.length,
      source: "OpenStreetMap Overpass",
    };
  } catch (error) {
    console.error("Error obteniendo cines cercanos:", error);
    return {
      success: false,
      error: "No pudimos consultar cines cercanos en este momento",
      data: [],
    };
  }
}

export function getPopularCinemaLinks(countryCode = "ES", region = "") {
  const regionLinks = REGION_CINEMA_LINKS.find((entry) => entry.match.test(region || ""));
  const countryLinks = REGIONAL_CINEMA_LINKS[String(countryCode || "ES").toUpperCase()] || REGIONAL_CINEMA_LINKS.ES;

  return {
    success: true,
    data: [...(regionLinks?.links || []), ...countryLinks].slice(0, 6),
    source: regionLinks ? "Regional cinema links" : "Country cinema links",
  };
}

export async function getCinemaDetails(cinemaId, countryCode) {
  return {
    success: false,
    error: "Los detalles del cine se consultan en tiempo real desde el listado cercano",
    cinemaId,
    countryCode,
  };
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}
