# Guia para abrir el proyecto en clase

Esta guia esta pensada para llevar el proyecto desde GitHub y abrirlo en un PC con Windows sin perder tiempo.

## 1. Que necesitas instalar

Antes de abrir la web, en el PC de clase debes tener instalado:

- `Node.js` versión 20 o superior
- `npm` junto con Node.js
- `Git`

Si falta Node.js, el proyecto no arranca.  
Si falta Git, no puedes bajar el repositorio.  
Si falta npm, no puedes instalar dependencias.

## 2. Descargar el proyecto desde GitHub

Abre PowerShell o la terminal de Windows y ejecuta:

```bash
git clone git@github.com:alumnodeikker/cinemark.git
cd cinemark
```

Si vas a actualizar una copia ya descargada:

```bash
git pull
```

## 3. Instalar dependencias

El proyecto no sube `node_modules`, asi que en el PC de clase hay que instalar todo:

```bash
npm install
```

## 4. Crear el archivo `.env.local`

La app necesita variables privadas para funcionar bien.

Toma el archivo `.env.example` y copialo como `.env.local`:

```bash
copy .env.example .env.local
```

Luego abre `.env.local` y deja tus claves reales dentro.

Debe quedar parecido a esto:

```env
TMDB_ACCESS_TOKEN=tu_token_real_de_tmdb
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GEMINI_API_KEY=tu_clave_real_de_google
GEMINI_MODEL=gemini-2.5-flash
```

## 5. Para que no falle en clase

Para que la web funcione igual que en tu Mac, revisa esto:

1. `TMDB_ACCESS_TOKEN` debe estar lleno.
2. `GEMINI_API_KEY` debe estar lleno si quieres usar el chat con Gemini.
3. Si no pones `GEMINI_API_KEY`, el chat sigue funcionando con fallback local, pero no usara Gemini.
4. Si no pones `TMDB_ACCESS_TOKEN`, la web no podra cargar peliculas de TMDB.
5. El archivo correcto es `.env.local`, no `.env.example`.
6. Si cambias el archivo `.env.local`, hay que reiniciar el servidor.

## 6. Arrancar la web

Cuando ya esta todo instalado:

```bash
npm run dev
```

Luego abre:

```text
http://localhost:3000
```

## 7. Si quieres actualizar desde GitHub antes de exponer

Si cambiaste cosas en tu Mac y las subiste a GitHub, en Windows haces:

```bash
git pull
npm install
npm run dev
```

## 8. Como explicarlo en clase

Puedes decirlo asi, de forma simple:

- La web usa TMDB para traer peliculas.
- Guarda favoritos, historial y seguimiento en el navegador.
- El buscador consulta peliculas por titulo.
- El asistente analiza lo que le gusta al usuario y recomienda una sola pelicula.
- Gemini redacta la respuesta del chat cuando la API key esta configurada.
- Si Gemini no esta disponible, el chat sigue funcionando con un modo local.

## 9. Resumen corto para decir en voz alta

> Primero instalo Node.js y Git, luego bajo el proyecto desde GitHub, ejecuto `npm install`, creo `.env.local` con el token de TMDB y la key de Gemini, y despues corro `npm run dev`. La web carga peliculas de TMDB, guarda datos en local y usa Gemini para el asistente.

