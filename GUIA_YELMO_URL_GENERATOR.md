# 🎬 Sistema de Generación de URLs para Cine Yelmo

## Descripción General

El sistema `yelmoUrlGenerator.js` genera automáticamente URLs válidas para Cine Yelmo sin necesidad de una API oficial, basándose en el análisis de la estructura real del sitio web.

**URLs generadas automáticamente:**
- Películas: `https://yelmocines.es/sinopsis/{película-slug}`
- Cartelera: `https://yelmocines.es/cartelera/{ciudad-slug}`
- Principal: `https://yelmocines.es`

---

## Instalación y Uso

### Función Principal: `generarUrlYelmo(movieName, location)`

```javascript
import { generarUrlYelmo } from "@/lib/yelmoUrlGenerator";

// Caso 1: Película + Ciudad
generarUrlYelmo("Gladiator II", "Madrid");
// → "https://yelmocines.es/sinopsis/gladiator-ii"

// Caso 2: Solo película
generarUrlYelmo("Avatar", null);
// → "https://yelmocines.es/sinopsis/avatar"

// Caso 3: Solo ciudad
generarUrlYelmo(null, "Barcelona");
// → "https://yelmocines.es/cartelera/barcelona"

// Caso 4: Fallback
generarUrlYelmo();
// → "https://yelmocines.es"
```

### Integración en Componentes React

#### En NearestCinemas.jsx

```jsx
import { generarUrlYelmo } from "@/lib/yelmoUrlGenerator";

export function NearestCinemas({ movieId, movieTitle }) {
  // ... código ...
  
  return (
    <a
      href={generarUrlYelmo(movieTitle, cinema.city)}
      target="_blank"
      rel="noopener noreferrer"
    >
      Comprar entradas
    </a>
  );
}
```

#### Con componentes de Yelmo

```jsx
import { YelmoTicketButton, YelmoMovieCard } from "@/components/movie/YelmoIntegration";

// Botón simple
<YelmoTicketButton movieTitle="Avatar" location="Madrid" />

// Card con información
<YelmoMovieCard movieTitle="Gladiator II" location="Barcelona" />

// Badge compacto
<YelmoBadge movieTitle="Avatar" location="Valencia" />
```

---

## Funciones Disponibles

### `generarUrlYelmo(movieName, location)`

**Función principal** que genera URLs inteligentes.

```typescript
generarUrlYelmo(movieName?: string, location?: string): string
```

**Parámetros:**
- `movieName` (opcional): Nombre de la película
- `location` (opcional): Ciudad o provincia

**Retorna:** URL válida de Yelmo

**Lógica:**
1. Si ambos parámetros → URL de película
2. Si solo película → URL de película
3. Si solo ubicación → URL de cartelera
4. Si nada → Página principal

---

### `normalizeSlug(text)`

Normaliza texto para crear slugs SEO-friendly. Maneja:
- Caracteres acentuados (á, é, í, ó, ú, ñ)
- Espacios y guiones bajos
- Caracteres especiales
- Guiones duplicados

```javascript
normalizeSlug("Cómo entrenar a tu dragón");
// → "como-entrenar-a-tu-dragon"

normalizeSlug("Gladiator II");
// → "gladiator-ii"

normalizeSlug("La 'verdadera' aventura");
// → "la-verdadera-aventura"
```

---

### `findLocation(location)`

Busca una ciudad o provincia en la base de datos.

```javascript
findLocation("Madrid");
// → { slug: "madrid", type: "city" }

findLocation("Álava");
// → { slug: "alava", type: "province" }

findLocation("atlantis");
// → null (no encontrado)
```

---

### `generateMovieUrl(movieName)`

Genera solo URL de película.

```javascript
generateMovieUrl("Avatar");
// → "https://yelmocines.es/sinopsis/avatar"
```

---

### `generateCinemaUrl(location)`

Genera solo URL de cartelera.

```javascript
generateCinemaUrl("Barcelona");
// → "https://yelmocines.es/cartelera/barcelona"
```

---

## Base de Datos de Ubicaciones

El sistema incluye **40+ ciudades y provincias españolas** donde Yelmo tiene cines:

### Ciudades principales:
- Madrid, Barcelona, Valencia, Bilbao, Sevilla, Málaga
- Alicante, Murcia, Zaragoza, Palma, Córdoba, Valladolid
- Vigo, Gijón, Vitoria, Ávila, Burgos, León, Oviedo
- Pamplona, Logroño, Albacete, Ciudad Real, Cuenca
- Guadalajara, Toledo, Cáceres, Badajoz, Huelva
- Cádiz, Jerez, Jaén, Granada, Almería, Tarragona
- Lleida, Girona, Manresa, Terrassa, Sabadell, Mataró, Badalona

### Provincias:
- Todas las provincias españolas con representación de Yelmo

---

## Casos de Uso

### 1. En página de película

```jsx
// En app/peli/[vin]/page.jsx
import { NearestCinemas } from "@/components/movie/NearestCinemas";

<NearestCinemas movieId={peli.id} movieTitle={peli.title} />
```

### 2. Con geolocalización

```jsx
import { useGeolocation } from "@/hooks/useGeolocation";
import { generarUrlYelmo } from "@/lib/yelmoUrlGenerator";

function MoviePage({ movie }) {
  const { location } = useGeolocation();
  
  const yelmoCinemasUrl = generarUrlYelmo(
    movie.title,
    location?.countryName
  );
  
  return <a href={yelmoCinemasUrl}>Ver en Yelmo</a>;
}
```

### 3. En carrusel de películas

```jsx
import { YelmoTicketButton } from "@/components/movie/YelmoIntegration";

function MovieCard({ movie, userCity }) {
  return (
    <div>
      <h3>{movie.title}</h3>
      <YelmoTicketButton movieTitle={movie.title} location={userCity} />
    </div>
  );
}
```

### 4. Sistema multi-cadenas (futuro)

```javascript
import { generarUrlYelmo } from "@/lib/yelmoUrlGenerator";
// import { generarUrlCinesa } from "@/lib/cinosaUrlGenerator";
// import { generarUrlOcine } from "@/lib/ocineUrlGenerator";

function generarUrlsCinesMultiples(movieTitle, location) {
  return {
    yelmo: generarUrlYelmo(movieTitle, location),
    // cinesa: generarUrlCinesa(movieTitle, location),
    // ocine: generarUrlOcine(movieTitle, location),
  };
}
```

---

## Validación de URLs

El sistema incluye funciones de validación:

### `isValidUrl(url)`

```javascript
isValidUrl("https://yelmocines.es/sinopsis/avatar");
// → true

isValidUrl("not a url");
// → false
```

### `sanitizeUrl(url)`

```javascript
sanitizeUrl("https://yelmocines.es//sinopsis//avatar");
// → "https://yelmocines.es/sinopsis/avatar"
```

---

## Características Clave

✅ **Sin API externa requerida** - Funciona completamente client-side
✅ **SEO-friendly slugs** - Normaliza caracteres acentuados y especiales
✅ **Fallback inteligente** - Siempre retorna URL válida
✅ **Base de datos actualizada** - 40+ ubicaciones españolas
✅ **Validación de URLs** - Previene URLs rotas
✅ **Componentes React listos** - YelmoTicketButton, YelmoMovieCard, YelmoBadge
✅ **Extensible** - Diseño preparado para otras cadenas (Cinesa, Ocine, etc.)

---

## Extensión a Otras Cadenas

El sistema está diseñado para ser extensible:

```javascript
// lib/cinemaUrlGenerators/index.js
export { generarUrlYelmo } from "./yelmo";
export { generarUrlCinesa } from "./cinesa";
export { generarUrlOcine } from "./ocine";
export { generarUrlKinopolis } from "./kinopolis";
```

Cada cadena tendría:
- Su propia base de datos de ubicaciones
- Su propio patrón de slug
- Su propia estructura de URLs

---

## Ejemplos Completos

### Ejemplo 1: Botón en detalle de película

```jsx
import { YelmoTicketButton } from "@/components/movie/YelmoIntegration";

export default function MovieDetailPage({ params }) {
  const movie = await fetchMovie(params.id);
  
  return (
    <div>
      <h1>{movie.title}</h1>
      <YelmoTicketButton 
        movieTitle={movie.title} 
        location="Madrid" 
      />
    </div>
  );
}
```

### Ejemplo 2: Búsqueda inteligente

```jsx
import { generarUrlYelmo } from "@/lib/yelmoUrlGenerator";
import { useGeolocation } from "@/hooks/useGeolocation";

function SearchResults({ results }) {
  const { location } = useGeolocation();
  
  return (
    <div className="grid">
      {results.map(movie => (
        <a
          key={movie.id}
          href={generarUrlYelmo(
            movie.title,
            location?.countryName
          )}
          target="_blank"
        >
          {movie.title}
        </a>
      ))}
    </div>
  );
}
```

### Ejemplo 3: Card con múltiples opciones

```jsx
import { YelmoMovieCard } from "@/components/movie/YelmoIntegration";

function MovieCard({ movie }) {
  return (
    <div className="border rounded-lg p-4">
      <img src={movie.poster} alt={movie.title} />
      <h3>{movie.title}</h3>
      <YelmoMovieCard 
        movieTitle={movie.title}
        location={movie.nearestCity}
      />
    </div>
  );
}
```

---

## Notas y Consideraciones

1. **Ubicación automática**: Si tienes acceso a la ubicación del usuario vía geolocalización, pasa `location?.countryName`

2. **Fallback robusto**: Si la ubicación no existe, automáticamente genera URL de película o principal

3. **Performance**: Todas las operaciones son síncronas y rápidas (no hay llamadas API)

4. **SEO**: Los slugs generados son SEO-friendly y consistentes

5. **Mantenimiento**: Si Yelmo cambia su estructura de URLs, solo hay que actualizar las funciones `generateMovieUrl()` y `generateCinemaUrl()`

6. **Futuro**: Extender para incluir:
   - Cinesa (cinesa.es)
   - Ocine (ocine.es)
   - Kinépolis (cinepolis.com)
   - Mk2 (mk2.com)

---

## Testing

Para probar el generador, ejecuta:

```bash
node LIB_YELMO_EJEMPLOS.js
```

Este archivo incluye 15+ casos de prueba que demuestran todos los usos del sistema.

