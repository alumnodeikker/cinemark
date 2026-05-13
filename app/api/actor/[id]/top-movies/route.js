import { fetchActor } from "@/lib/Api_";

function sortByPopularity(items = []) {
  return [...items].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
}

export async function GET(_request, { params }) {
  const { id } = await params;

  if (!id || !/^\d+$/.test(id)) {
    return Response.json({ movies: [] }, { status: 400 });
  }

  try {
    const actor = await fetchActor(id);
    const movies = sortByPopularity(actor?.movie_credits?.cast ?? [])
      .slice(0, 3)
      .map((movie) => ({
        id: movie.id,
        title: movie.title ?? "Sin titulo",
        popularity: Math.round(movie.popularity ?? 0),
      }));

    return Response.json(
      { movies },
      {
        headers: {
          "Cache-Control": "private, max-age=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch {
    return Response.json({ movies: [] }, { status: 500 });
  }
}
