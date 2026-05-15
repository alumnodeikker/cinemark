import { searchMovies } from "@/lib/tmdb";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().slice(0, 80);

  if (q.length < 2) {
    return Response.json(
      { results: [] },
      { headers: { "Cache-Control": "private, max-age=60" } }
    );
  }

  const data = await searchMovies(q);
  const results = Array.isArray(data?.results)
    ? data.results.slice(0, 8).map((movie) => ({
        id: movie.id,
        title: movie.title ?? "",
        overview: movie.overview ?? "",
        poster_path: movie.poster_path ?? null,
        release_date: movie.release_date ?? "",
        vote_average: movie.vote_average ?? 0,
      }))
    : [];

  return Response.json(
    { results },
    { headers: { "Cache-Control": "private, max-age=60" } }
  );
}
