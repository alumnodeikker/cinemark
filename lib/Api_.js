//2o peliculas 
export async function traerPeliculas() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.log(`TMDB error: ${res.status}`);
      return [];
    }

    const datos = await res.json();
    return Array.isArray(datos?.results) ? datos.results : [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

//Pelis Individual 
export async function fetchPeli(idPeli) {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${idPeli}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&append_to_response=videos`);
    const data = await res.json();
    return data;
}


// Búsqueda de películas
export async function fetchBusqueda(query) {
  try {
    // Punto de aprendizaje: encodeURIComponent para que los caracteres especiales (espacios, acentos) no rompan la URL.
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=es-ES`
    );
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    const data = await res.json();
    console.log(data) // Siempre nos va a dar 20 resultados como máximo
    return data; // { results: [], total_results: N, ... }
  } catch (error) {
    console.error("Error en la búsqueda:", error);
  }
}
