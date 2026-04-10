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
