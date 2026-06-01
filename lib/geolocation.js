// Utilidades de geolocalización con cumplimiento RGPD

const GEOLOCATION_CONSENT_KEY = "geolocation_consent_given";
const GEOLOCATION_DATA_KEY = "user_geolocation_data";
const GEOLOCATION_PREFERENCE_KEY = "geolocation_preference";
const GEOLOCATION_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Estados de preferencia de geolocalización
 * - not_configured: Primera vez, mostrar banner
 * - accepted: Usuario aceptó, cargar ubicación
 * - denied: Usuario rechazó, no volver a solicitar
 */
const PREFERENCE_STATES = {
  NOT_CONFIGURED: "not_configured",
  ACCEPTED: "accepted",
  DENIED: "denied",
};

/**
 * Obtener preferencia de geolocalización del usuario
 */
export function getLocationPreference() {
  if (typeof window === "undefined") return PREFERENCE_STATES.NOT_CONFIGURED;
  const pref = localStorage.getItem(GEOLOCATION_PREFERENCE_KEY);
  return pref || PREFERENCE_STATES.NOT_CONFIGURED;
}

/**
 * Guardar preferencia de geolocalización
 */
export function setLocationPreference(preference) {
  if (typeof window === "undefined") return;
  if (!Object.values(PREFERENCE_STATES).includes(preference)) {
    console.warn(`Preferencia inválida: ${preference}`);
    return;
  }
  localStorage.setItem(GEOLOCATION_PREFERENCE_KEY, preference);
}

/**
 * Resetear preferencia (para permitir cambios desde ajustes)
 */
export function resetLocationPreference() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GEOLOCATION_PREFERENCE_KEY);
  localStorage.removeItem(GEOLOCATION_CONSENT_KEY);
  localStorage.removeItem(GEOLOCATION_DATA_KEY);
}

/**
 * Verificar si debemos mostrar el banner de ubicación
 * Solo se muestra si es la primera vez (not_configured)
 */
export function shouldShowLocationBanner() {
  if (typeof window === "undefined") return false;
  const preference = getLocationPreference();
  return preference === PREFERENCE_STATES.NOT_CONFIGURED;
}

/**
 * Verificar si el usuario ya tomó una decisión
 */
export function hasLocationDecision() {
  if (typeof window === "undefined") return false;
  const preference = getLocationPreference();
  return preference !== PREFERENCE_STATES.NOT_CONFIGURED;
}

/**
 * Verificar si el usuario acepta geolocalización
 */
export function isLocationAllowed() {
  if (typeof window === "undefined") return false;
  const preference = getLocationPreference();
  return preference === PREFERENCE_STATES.ACCEPTED;
}

/**
 * Verificar si el usuario rechazó geolocalización
 */
export function isLocationDenied() {
  if (typeof window === "undefined") return false;
  const preference = getLocationPreference();
  return preference === PREFERENCE_STATES.DENIED;
}

/**
 * Verificar si el usuario ha dado consentimiento para geolocalización
 */
export function hasGeolocationConsent() {
  if (typeof window === "undefined") return false;
  const consent = localStorage.getItem(GEOLOCATION_CONSENT_KEY);
  return consent === "true";
}

/**
 * Guardar consentimiento de geolocalización
 */
export function setGeolocationConsent(consent) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GEOLOCATION_CONSENT_KEY, String(consent));
}

/**
 * Obtener datos de geolocalización cacheados
 */
export function getCachedGeolocation() {
  if (typeof window === "undefined") return null;
  try {
    const data = JSON.parse(localStorage.getItem(GEOLOCATION_DATA_KEY) || "null");
    if (!data) return null;

    const now = Date.now();
    if (now - data.timestamp > GEOLOCATION_CACHE_TTL) {
      localStorage.removeItem(GEOLOCATION_DATA_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Guardar datos de geolocalización en caché
 */
export function cacheGeolocation(geoData) {
  if (typeof window === "undefined") return;
  try {
    const data = {
      latitude: geoData.latitude,
      longitude: geoData.longitude,
      accuracy: geoData.accuracy,
      countryCode: geoData.countryCode,
      countryName: geoData.countryName,
      region: geoData.region,
      address: geoData.address,
      timestamp: Date.now(),
    };
    localStorage.setItem(GEOLOCATION_DATA_KEY, JSON.stringify(data));
  } catch {
    console.warn("No se pudo cachear geolocalización");
  }
}

/**
 * Obtener país desde coordenadas usando API gratuita
 */
export async function getCountryFromCoordinates(latitude, longitude) {
  try {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
      });
      const response = await fetch(`/api/geolocation/reverse?${params}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Error en geocodificación inversa local");
      return response.json();
    }

    // Usando API gratuita de nominatim (OpenStreetMap)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          "Accept-Language": "es",
        },
      }
    );

    if (!response.ok) throw new Error("Error en geocodificación inversa");

    const data = await response.json();
    const countryCode = data.address?.country_code?.toUpperCase();
    const countryName = data.address?.country;

    return {
      countryCode,
      countryName,
      address: data.address?.city || data.address?.town || data.address?.state,
    };
  } catch (error) {
    console.warn("Error obteniendo país desde coordenadas:", error);
    return null;
  }
}

/**
 * Obtener país desde IP (como fallback)
 */
export async function getCountryFromIP() {
  try {
    if (typeof window !== "undefined") {
      const response = await fetch("/api/geolocation/country", {
        cache: "force-cache",
      });
      if (!response.ok) throw new Error("Error obteniendo país desde API local");
      return response.json();
    }

    // Usando API gratuita ip-api.com (sin clave, limitado pero suficiente)
    const response = await fetch("https://ip-api.com/json/?fields=countryCode,country,regionName", {
      cache: "force-cache",
      next: { revalidate: 86400 }, // Cachear 24 horas en Next.js
    });

    if (!response.ok) throw new Error("Error obteniendo país desde IP");

    const data = await response.json();

    if (data.status !== "success") throw new Error("IP API error");

    return {
      countryCode: data.countryCode,
      countryName: data.country,
      region: data.regionName,
    };
  } catch (error) {
    console.warn("Error obteniendo país desde IP:", error);
    // Fallback a ES si todo falla
    return {
      countryCode: "ES",
      countryName: "España",
      region: null,
    };
  }
}

/**
 * Obtener coordenadas del usuario con permiso del navegador
 * Retorna null si el usuario no da permiso
 */
export async function getUserCoordinates() {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return null;
  }

  return new Promise((resolve) => {
    const options = {
      enableHighAccuracy: false, // No usar GPS preciso para ahorrar batería
      timeout: 10000,
      maximumAge: 5 * 60 * 1000, // Reutilizar posición de hace 5 minutos máximo
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.warn("Error de geolocalización:", error.message);
        resolve(null);
      },
      options
    );
  });
}

/**
 * Calcular distancia entre dos puntos (fórmula Haversine)
 * Retorna distancia en km
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
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
  const distance = R * c;

  return parseFloat(distance.toFixed(1));
}
