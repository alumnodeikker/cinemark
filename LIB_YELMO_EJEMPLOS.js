/**
 * EJEMPLOS DE USO: Sistema de generación de URLs para Cine Yelmo
 * 
 * Este archivo demuestra todas las formas de usar la función generarUrlYelmo()
 * con casos reales y resultados esperados
 */

import {
  generarUrlYelmo,
  normalizeSlug,
  generateMovieUrl,
  generateCinemaUrl,
  findLocation,
} from "./yelmoUrlGenerator";

console.log("=== EJEMPLOS DE NORMALIZACIÓN ===\n");

// Ejemplo 1: Películas con caracteres especiales
console.log('normalizeSlug("Gladiator II")');
console.log("→", normalizeSlug("Gladiator II"));
console.log("Esperado: gladiator-ii\n");

// Ejemplo 2: Texto con acentos
console.log('normalizeSlug("Cómo entrenar a tu dragón")');
console.log("→", normalizeSlug("Cómo entrenar a tu dragón"));
console.log("Esperado: como-entrenar-a-tu-dragon\n");

// Ejemplo 3: Provincias con acentos
console.log('normalizeSlug("Álava")');
console.log("→", normalizeSlug("Álava"));
console.log("Esperado: alava\n");

// Ejemplo 4: Caracteres especiales
console.log('normalizeSlug("¿Avatar?")');
console.log("→", normalizeSlug("¿Avatar?"));
console.log("Esperado: avatar\n");

// Ejemplo 5: Múltiples espacios
console.log('normalizeSlug("El   señor   de   los   anillos")');
console.log("→", normalizeSlug("El   señor   de   los   anillos"));
console.log("Esperado: el-senor-de-los-anillos\n");

console.log("\n=== EJEMPLOS DE GENERACIÓN DE URLs (PELÍCULA + UBICACIÓN) ===\n");

// Caso 1: Película + Ciudad
console.log('generarUrlYelmo("Gladiator II", "Madrid")');
console.log("→", generarUrlYelmo("Gladiator II", "Madrid"));
console.log("Esperado: https://yelmocines.es/sinopsis/gladiator-ii\n");

// Caso 2: Película + Provincia
console.log('generarUrlYelmo("Avatar", "Barcelona")');
console.log("→", generarUrlYelmo("Avatar", "Barcelona"));
console.log("Esperado: https://yelmocines.es/sinopsis/avatar\n");

// Caso 3: Película con acentos + Ubicación
console.log('generarUrlYelmo("Cómo entrenar a tu dragón", "Valencia")');
console.log("→", generarUrlYelmo("Cómo entrenar a tu dragón", "Valencia"));
console.log("Esperado: https://yelmocines.es/sinopsis/como-entrenar-a-tu-dragon\n");

console.log("\n=== EJEMPLOS SOLO PELÍCULA ===\n");

// Caso 4: Solo película
console.log('generarUrlYelmo("Avengers", null)');
console.log("→", generarUrlYelmo("Avengers", null));
console.log("Esperado: https://yelmocines.es/sinopsis/avengers\n");

// Caso 5: Solo película (alternativa)
console.log('generarUrlYelmo("Shrek 25 Aniversario")');
console.log("→", generarUrlYelmo("Shrek 25 Aniversario"));
console.log("Esperado: https://yelmocines.es/sinopsis/shrek-25-aniversario\n");

console.log("\n=== EJEMPLOS SOLO UBICACIÓN ===\n");

// Caso 6: Solo ciudad
console.log('generarUrlYelmo(null, "Bilbao")');
console.log("→", generarUrlYelmo(null, "Bilbao"));
console.log("Esperado: https://yelmocines.es/cartelera/bilbao\n");

// Caso 7: Solo provincia
console.log('generarUrlYelmo(null, "Álava")');
console.log("→", generarUrlYelmo(null, "Álava"));
console.log("Esperado: https://yelmocines.es/cartelera/alava\n");

// Caso 8: Solo ciudad alternativa
console.log('generarUrlYelmo(null, "Vitoria-Gasteiz")');
console.log("→", generarUrlYelmo(null, "Vitoria-Gasteiz"));
console.log("Esperado: https://yelmocines.es/cartelera/vitoria\n");

// Caso 9: Solo Gipuzkoa
console.log('generarUrlYelmo(null, "Gipuzkoa")');
console.log("→", generarUrlYelmo(null, "Gipuzkoa"));
console.log("Esperado: https://yelmocines.es/cartelera/gipuzkoa\n");

console.log("\n=== EJEMPLOS FALLBACK (SIN PARÁMETROS) ===\n");

// Caso 10: Sin parámetros
console.log('generarUrlYelmo()');
console.log("→", generarUrlYelmo());
console.log("Esperado: https://yelmocines.es\n");

// Caso 11: Parámetros nulos
console.log('generarUrlYelmo(null, null)');
console.log("→", generarUrlYelmo(null, null));
console.log("Esperado: https://yelmocines.es\n");

// Caso 12: Strings vacíos
console.log('generarUrlYelmo("", "")');
console.log("→", generarUrlYelmo("", ""));
console.log("Esperado: https://yelmocines.es\n");

console.log("\n=== EJEMPLOS CASOS ESPECIALES ===\n");

// Caso 13: Ubicación no encontrada
console.log('generarUrlYelmo("Avatar", "Atlantis")');
console.log("→", generarUrlYelmo("Avatar", "Atlantis"));
console.log("Esperado: https://yelmocines.es/sinopsis/avatar (fallback a película)\n");

// Caso 14: Película con números romanos
console.log('generarUrlYelmo("Gladiator II", "Madrid")');
console.log("→", generarUrlYelmo("Gladiator II", "Madrid"));
console.log("Esperado: https://yelmocines.es/sinopsis/gladiator-ii\n");

// Caso 15: Película con comillas
console.log('generarUrlYelmo("La \'verdadera\' aventura", "Barcelona")');
console.log("→", generarUrlYelmo("La 'verdadera' aventura", "Barcelona"));
console.log("Esperado: https://yelmocines.es/sinopsis/la-verdadera-aventura\n");

console.log("\n=== BÚSQUEDA DE UBICACIONES ===\n");

// Búsqueda de ubicación
console.log('findLocation("Madrid")');
console.log("→", findLocation("Madrid"));
console.log("");

console.log('findLocation("Álava")');
console.log("→", findLocation("Álava"));
console.log("");

console.log('findLocation("Barcelona")');
console.log("→", findLocation("Barcelona"));
console.log("");

console.log('findLocation("vitoria-gasteiz")');
console.log("→", findLocation("vitoria-gasteiz"));
console.log("");

console.log("\n=== EJEMPLOS DE INTEGRACIÓN EN COMPONENTES ===\n");

console.log("En componente React:");
console.log(`
import { generarUrlYelmo } from "@/lib/yelmoUrlGenerator";

function CinemaTicketButton({ movieTitle, userLocation }) {
  const yelmoCinemasUrl = generarUrlYelmo(movieTitle, userLocation);
  
  return (
    <a 
      href={yelmoCinemasUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="btn-comprar-entradas"
    >
      Comprar entradas en Yelmo
    </a>
  );
}

// Uso
<CinemaTicketButton movieTitle="Gladiator II" userLocation="Madrid" />
// → Genera: https://yelmocines.es/sinopsis/gladiator-ii
`);

console.log("\n=== CASOS DE USO CON GEOLOCALIZACIÓN ===\n");

console.log("Con ubicación del usuario detectada:");
console.log(`
import { useGeolocation } from "@/hooks/useGeolocation";
import { generarUrlYelmo } from "@/lib/yelmoUrlGenerator";

function MoviePage({ movie }) {
  const { location } = useGeolocation();
  
  // Genera URL automática con ubicación del usuario
  const yelmoCinemasUrl = generarUrlYelmo(
    movie.title,
    location?.countryName // ej: "Madrid" de la geolocalización
  );
  
  return (
    <a href={yelmoCinemasUrl} target="_blank">
      Ver sesiones en Yelmo
    </a>
  );
}
`);

console.log("\n=== CASOS DE USO MÚLTIPLES CADENAS ===\n");

console.log("Función extensible para otras cadenas:");
console.log(`
const CINEMA_CHAINS = {
  yelmo: generarUrlYelmo,
  // Próximamente: cinesa, ocine, kinopolis, mk2
};

function generarUrlsCinesMultiples(movieTitle, location) {
  return {
    yelmo: generarUrlYelmo(movieTitle, location),
    // cinesa: generarUrlCinesa(movieTitle, location),
    // ocine: generarUrlOcine(movieTitle, location),
  };
}

const urls = generarUrlsCinesMultiples("Avatar", "Madrid");
// {
//   yelmo: "https://yelmocines.es/sinopsis/avatar"
//   // cinesa: "https://www.cinesa.es/...",
// }
`);
