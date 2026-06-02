# Guia rapida para exponer el proyecto

## 1. Que hace la web

Esta web es un catalogo de peliculas hecho con Next.js. Permite:

- buscar peliculas por nombre
- ver trailers, fichas, reparto e imagenes
- guardar peliculas en favoritos
- marcar peliculas como vistas
- seguir estrenos para recibir aviso cuando lleguen a cine
- abrir un asistente tipo chat para pedir una recomendacion

La idea principal es que el usuario no tenga que pensar demasiado. La web le ayuda a decidir que ver.

## 2. Como funciona la pagina principal

La pantalla principal junta varias secciones:

- `Que ver hoy`
- `Estreno destacado`
- `Trailers`
- `Tendencias`
- `Recomendaciones personalizadas`

Cada seccion usa datos de TMDB o datos locales del usuario.

### Archivos clave

- [components/home/HomeMovies.jsx](./components/home/HomeMovies.jsx)
- [components/home/WatchTodayRecommendation.jsx](./components/home/WatchTodayRecommendation.jsx)
- [components/home/RegionalTrends.jsx](./components/home/RegionalTrends.jsx)
- [components/home/PersonalizedRecommendations.jsx](./components/home/PersonalizedRecommendations.jsx)

## 3. Como funciona la busqueda

La barra de busqueda del header busca peliculas por titulo mientras escribes.

Flujo:

1. El usuario escribe en la barra.
2. El frontend llama a `/api/search`.
3. La API consulta TMDB.
4. Devuelve resultados cortos con titulo, poster, fecha y nota.
5. El usuario entra a la ficha desde el resultado.

### Archivos clave

- [components/layout/Header.jsx](./components/layout/Header.jsx)
- [app/api/search/route.js](./app/api/search/route.js)
- [lib/tmdb.js](./lib/tmdb.js)

## 4. Como funciona la IA

La IA esta en el asistente de la web.

### Lo que hace

- lee favoritos
- lee historial visto
- lee peliculas en seguimiento
- mira la hora y el dia
- recomienda una pelicula concreta para ver hoy
- responde como conversacion normal cuando el usuario escribe cualquier cosa

### Flujo real

1. El usuario escribe en el chat.
2. El frontend manda el mensaje a `/api/assistant`.
3. La API primero calcula una recomendacion local.
4. Si existe `GEMINI_API_KEY`, la respuesta de texto la redacta Gemini.
5. Si Gemini falla, usa un fallback local para que la app siga funcionando.

### Importante

- La clave de Gemini nunca va en el frontend.
- Debe vivir en `.env.local`.
- En el proyecto se deja como ejemplo en `.env.example`.

### Archivos clave

- [app/api/assistant/route.js](./app/api/assistant/route.js)
- [components/assistant/MovieAssistantChat.jsx](./components/assistant/MovieAssistantChat.jsx)
- [components/assistant/AssistantFloatingButton.jsx](./components/assistant/AssistantFloatingButton.jsx)

## 5. Como funciona la recomendacion de "Que ver hoy"

Esta parte no muestra muchas peliculas. Muestra una sola, porque el objetivo es resolver el tipico problema de "no se que ver".

La seleccion usa:

- favoritos
- historial visto
- seguimiento
- hora actual
- dia de la semana

La idea es que no recomiende lo mismo todo el tiempo. Si cambia la hora o si el usuario pulsa "Otra opcion", el resultado cambia.

### Archivos clave

- [app/api/watch-today/route.js](./app/api/watch-today/route.js)
- [lib/tmdb.js](./lib/tmdb.js)

## 6. Como funciona el seguimiento de estrenos

En `Proximamente en cines` el boton `+` guarda la pelicula en seguimiento.

Luego:

- aparece en la pagina `/seguimiento`
- puede quitarse con `Dejar de seguir`
- la app puede avisar cuando llega la fecha de estreno

### Archivos clave

- [components/home/UpcomingTrailers.jsx](./components/home/UpcomingTrailers.jsx)
- [components/favorites/TrackedMovies.jsx](./components/favorites/TrackedMovies.jsx)
- [components/notifications/ReleaseReminderNotifier.jsx](./components/notifications/ReleaseReminderNotifier.jsx)
- [app/seguimiento/page.jsx](./app/seguimiento/page.jsx)

## 7. Donde se guarda la informacion

Todo lo que el usuario marca se guarda en `Zustand` con persistencia local.

Eso incluye:

- favoritos
- watchlist / seguimiento
- historial visto
- comentarios
- datos de usuario
- geolocalizacion cacheada

### Archivo clave

- [stores/movieStore.js](./stores/movieStore.js)

## 8. Variables de entorno

Para que funcione bien necesitas estas variables en `.env.local`:

```env
TMDB_ACCESS_TOKEN=tu_token_de_tmbd
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GEMINI_API_KEY=tu_key_de_google_ai_studio
GEMINI_MODEL=gemini-2.5-flash
```

### Regla importante

`.env.example` solo sirve de plantilla.  
El archivo que lee Next de verdad es `.env.local`.

## 9. Como explicar el codigo en clase

Una forma simple de presentarlo es esta:

1. La web consume peliculas desde TMDB.
2. El usuario puede buscar, guardar, ver trailers y seguir estrenos.
3. El estado se guarda localmente en el navegador.
4. La IA analiza esos datos y recomienda una pelicula concreta.
5. Gemini redacta la respuesta del chat cuando esta disponible.
6. Si Gemini falla, la app sigue funcionando con fallback local.

## 10. Resumen corto para exponer

> Esta web es un catalogo de peliculas con busqueda, favoritos, seguimiento de estrenos y un asistente de IA.  
> Usa TMDB para traer peliculas y Gemini para conversar con el usuario y recomendarle que ver hoy.  
> La informacion del usuario se guarda localmente en el navegador.

