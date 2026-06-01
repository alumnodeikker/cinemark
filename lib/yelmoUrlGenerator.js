/**
 * Sistema de generación de URLs dinámicas para Cine Yelmo
 * Basado en análisis de la estructura real del sitio
 *
 * Estructura URL identificada:
 * - Películas: https://yelmocines.es/sinopsis/{slug-película}
 * - Cartelera por ciudad: https://yelmocines.es/cartelera/{ciudad}
 * - Página principal: https://yelmocines.es
 *
 * Base de datos de ciudades/provincias españolas con cines Yelmo
 */

/**
 * Base de datos de ciudades y provincias con cines Yelmo
 * Estructura: { "nombre": "slug", "provincias": ["slug1", "slug2"] }
 */
const YELMO_LOCATIONS = {
  // Ciudades principales
  "madrid": { slug: "madrid", type: "city" },
  "barcelona": { slug: "barcelona", type: "city" },
  "valencia": { slug: "valencia", type: "city" },
  "bilbao": { slug: "bilbao", type: "city" },
  "sevilla": { slug: "sevilla", type: "city" },
  "malaga": { slug: "malaga", type: "city" },
  "alicante": { slug: "alicante", type: "city" },
  "murcia": { slug: "murcia", type: "city" },
  "zaragoza": { slug: "zaragoza", type: "city" },
  "palma": { slug: "palma", type: "city" },
  "cordoba": { slug: "cordoba", type: "city" },
  "valladolid": { slug: "valladolid", type: "city" },
  "vigo": { slug: "vigo", type: "city" },
  "gijon": { slug: "gijon", type: "city" },
  "vitoria": { slug: "vitoria", type: "city" },
  "vitoria-gasteiz": { slug: "vitoria", type: "city" },
  "avila": { slug: "avila", type: "city" },
  "burgos": { slug: "burgos", type: "city" },
  "leon": { slug: "leon", type: "city" },
  "oviedo": { slug: "oviedo", type: "city" },
  "pamplona": { slug: "pamplona", type: "city" },
  "logrono": { slug: "logrono", type: "city" },
  "albacete": { slug: "albacete", type: "city" },
  "ciudad-real": { slug: "ciudad-real", type: "city" },
  "cuenca": { slug: "cuenca", type: "city" },
  "guadalajara": { slug: "guadalajara", type: "city" },
  "toledo": { slug: "toledo", type: "city" },
  "caceres": { slug: "caceres", type: "city" },
  "badajoz": { slug: "badajoz", type: "city" },
  "huelva": { slug: "huelva", type: "city" },
  "cadiz": { slug: "cadiz", type: "city" },
  "jerez": { slug: "jerez", type: "city" },
  "jaen": { slug: "jaen", type: "city" },
  "granada": { slug: "granada", type: "city" },
  "almeria": { slug: "almeria", type: "city" },
  "tarragona": { slug: "tarragona", type: "city" },
  "lleida": { slug: "lleida", type: "city" },
  "girona": { slug: "girona", type: "city" },
  "manresa": { slug: "manresa", type: "city" },
  "terrassa": { slug: "terrassa", type: "city" },
  "sabadell": { slug: "sabadell", type: "city" },
  "mataró": { slug: "mataro", type: "city" },
  "badalona": { slug: "badalona", type: "city" },

  // Provincias
  "madrid": { slug: "madrid", type: "province" },
  "barcelona": { slug: "barcelona", type: "province" },
  "valencia": { slug: "valencia", type: "province" },
  "vizcaya": { slug: "vizcaya", type: "province" },
  "sevilla": { slug: "sevilla", type: "province" },
  "malaga": { slug: "malaga", type: "province" },
  "alicante": { slug: "alicante", type: "province" },
  "murcia": { slug: "murcia", type: "province" },
  "zaragoza": { slug: "zaragoza", type: "province" },
  "islas-baleares": { slug: "islas-baleares", type: "province" },
  "cordoba": { slug: "cordoba", type: "province" },
  "valladolid": { slug: "valladolid", type: "province" },
  "pontevedra": { slug: "pontevedra", type: "province" },
  "asturias": { slug: "asturias", type: "province" },
  "alava": { slug: "alava", type: "province" },
  "gipuzkoa": { slug: "gipuzkoa", type: "province" },
  "avila": { slug: "avila", type: "province" },
  "burgos": { slug: "burgos", type: "province" },
  "leon": { slug: "leon", type: "province" },
  "navarra": { slug: "navarra", type: "province" },
  "la-rioja": { slug: "la-rioja", type: "province" },
  "albacete": { slug: "albacete", type: "province" },
  "ciudad-real": { slug: "ciudad-real", type: "province" },
  "cuenca": { slug: "cuenca", type: "province" },
  "guadalajara": { slug: "guadalajara", type: "province" },
  "toledo": { slug: "toledo", type: "province" },
  "caceres": { slug: "caceres", type: "province" },
  "badajoz": { slug: "badajoz", type: "province" },
  "huelva": { slug: "huelva", type: "province" },
  "cadiz": { slug: "cadiz", type: "province" },
  "jaen": { slug: "jaen", type: "province" },
  "granada": { slug: "granada", type: "province" },
  "almeria": { slug: "almeria", type: "province" },
  "tarragona": { slug: "tarragona", type: "province" },
  "lleida": { slug: "lleida", type: "province" },
  "girona": { slug: "girona", type: "province" },
  "ceuta": { slug: "ceuta", type: "province" },
  "melilla": { slug: "melilla", type: "province" },
};

/**
 * Normaliza texto para crear slugs SEO-friendly
 * 
 * @param {string} text - Texto a normalizar
 * @returns {string} Slug limpio y SEO-friendly
 * 
 * @example
 * normalizeSlug("Gladiator II") // "gladiator-ii"
 * normalizeSlug("Cómo entrenar a tu dragón") // "como-entrenar-a-tu-dragon"
 * normalizeSlug("¿Avatar?") // "avatar"
 */
function normalizeSlug(text) {
  if (!text) return "";

  return (
    text
      // Convertir a minúsculas
      .toLowerCase()
      // Normalizar caracteres acentuados (NFD = descomposición)
      .normalize("NFD")
      // Eliminar diacríticos (marcas de acento)
      .replace(/[\u0300-\u036f]/g, "")
      // Reemplazar espacios y guiones bajos por guiones
      .replace(/[\s_]+/g, "-")
      // Eliminar caracteres especiales (mantener solo letras, números y guiones)
      .replace(/[^\w\-]/g, "")
      // Eliminar guiones duplicados
      .replace(/\-+/g, "-")
      // Eliminar guiones al inicio y final
      .replace(/^\-+|\-+$/g, "")
  );
}

/**
 * Valida si una URL tiene formato válido
 * 
 * @param {string} url - URL a validar
 * @returns {boolean} True si la URL es válida
 */
function isValidUrl(url) {
  if (!url || typeof url !== "string") return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Sanitiza una URL (elimina dobles barras, etc)
 * 
 * @param {string} url - URL a sanitizar
 * @returns {string} URL sanitizada
 */
function sanitizeUrl(url) {
  if (!url) return "";

  return url
    // Eliminar dobles barras (excepto después de ://)
    .replace(/([^:]\/)\/+/g, "$1")
    // Eliminar espacios
    .trim();
}

/**
 * Busca una ciudad/provincia en la base de datos
 * 
 * @param {string} location - Nombre de ciudad/provincia
 * @returns {object|null} Ubicación encontrada o null
 */
function findLocation(location) {
  if (!location) return null;

  const normalized = normalizeSlug(location);

  // Búsqueda exacta
  if (YELMO_LOCATIONS[normalized]) {
    return YELMO_LOCATIONS[normalized];
  }

  // Búsqueda parcial (contiene)
  const key = Object.keys(YELMO_LOCATIONS).find((k) =>
    k.includes(normalized) || normalized.includes(k)
  );

  return key ? YELMO_LOCATIONS[key] : null;
}

/**
 * Genera URL de película en Cine Yelmo
 * 
 * @param {string} movieName - Nombre de la película
 * @returns {string} URL de la película
 */
function generateMovieUrl(movieName) {
  if (!movieName) return null;

  const movieSlug = normalizeSlug(movieName);
  if (!movieSlug) return null;

  return `https://yelmocines.es/sinopsis/${movieSlug}`;
}

/**
 * Genera URL de cartelera de una ciudad/provincia
 * 
 * @param {string} location - Nombre de ciudad o provincia
 * @returns {string} URL de cartelera
 */
function generateCinemaUrl(location) {
  if (!location) return null;

  const foundLocation = findLocation(location);
  if (!foundLocation) return null;

  return `https://yelmocines.es/cartelera/${foundLocation.slug}`;
}

/**
 * FUNCIÓN PRINCIPAL
 * Genera URL inteligente para Cine Yelmo
 * 
 * Casos:
 * 1. movie + location → URL específica de película en esa ciudad
 * 2. movie solo → URL de película
 * 3. location solo → URL de cartelera
 * 4. nada → Página principal
 * 
 * @param {string} movieName - Nombre de la película (opcional)
 * @param {string} location - Ciudad o provincia (opcional)
 * @returns {string} URL válida de Cine Yelmo
 * 
 * @example
 * generarUrlYelmo("Gladiator II", "Madrid")
 * // "https://yelmocines.es/sinopsis/gladiator-ii"
 * 
 * @example
 * generarUrlYelmo("Avatar", null)
 * // "https://yelmocines.es/sinopsis/avatar"
 * 
 * @example
 * generarUrlYelmo(null, "Barcelona")
 * // "https://yelmocines.es/cartelera/barcelona"
 * 
 * @example
 * generarUrlYelmo(null, null)
 * // "https://yelmocines.es"
 */
function generarUrlYelmo(movieName = null, location = null) {
  // Validar y limpiar parámetros
  const movie = movieName ? String(movieName).trim() : null;
  const city = location ? String(location).trim() : null;

  // Caso 1: Ambos parámetros disponibles
  // Genera URL de película (la película es el contenido principal)
  if (movie && city) {
    const movieUrl = generateMovieUrl(movie);
    if (movieUrl && isValidUrl(movieUrl)) {
      return sanitizeUrl(movieUrl);
    }
  }

  // Caso 2: Solo película
  if (movie && !city) {
    const movieUrl = generateMovieUrl(movie);
    if (movieUrl && isValidUrl(movieUrl)) {
      return sanitizeUrl(movieUrl);
    }
  }

  // Caso 3: Solo ubicación
  if (!movie && city) {
    const cinemaUrl = generateCinemaUrl(city);
    if (cinemaUrl && isValidUrl(cinemaUrl)) {
      return sanitizeUrl(cinemaUrl);
    }
  }

  // Caso 4: Fallback - página principal
  return "https://yelmocines.es";
}

/**
 * Exportar funciones
 */
export {
  generarUrlYelmo,
  normalizeSlug,
  generateMovieUrl,
  generateCinemaUrl,
  findLocation,
  YELMO_LOCATIONS,
  isValidUrl,
  sanitizeUrl,
};
