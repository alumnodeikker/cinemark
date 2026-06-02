# Cinemark

Aplicacion de peliculas hecha con Next.js. Permite buscar titulos, ver trailers, guardar favoritos, seguir estrenos, revisar tendencias por region y usar un asistente conversacional que recomienda que ver hoy.

## Funciones

- Busqueda de peliculas por titulo
- Fichas con trailer, reparto e imagenes
- Favoritos e historial local
- Seguimiento de estrenos
- Tendencias segun region
- Recomendaciones personalizadas
- Asistente tipo chat con Gemini y fallback local

## Requisitos

- Node.js 20 o superior
- npm
- Git

## Instalacion local

```bash
git clone git@github.com:alumnodeikker/cinemark.git
cd cinemark
npm install
copy .env.example .env.local
npm run dev
```

Luego abre:

```text
http://localhost:3000
```

## Variables de entorno

Edita `.env.local` y coloca tus claves reales:

```env
TMDB_ACCESS_TOKEN=tu_token_real_de_tmdb
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GEMINI_API_KEY=tu_clave_real_de_google
GEMINI_MODEL=gemini-2.5-flash
```

## Guia para clase

Si vas a abrirlo en Windows para exponer, usa esta guia:

- [GUIA_CLASE_WINDOWS.md](./GUIA_CLASE_WINDOWS.md)

## Estructura general

- `app/` rutas y paginas
- `components/` interfaz y widgets
- `lib/` logica de TMDB, geolocalizacion y utilidades
- `stores/` estado local del usuario

## Notas

- `.env.example` es solo plantilla.
- `.env.local` no se sube a GitHub.
- Si cambias variables de entorno, reinicia el servidor.

