import {
  parseTmdbId,
  protectedJson,
  rejectCrossSiteRequest,
  rejectIfRateLimited,
} from "@/lib/apiProtection";
import { getActor } from "@/lib/tmdb";

function sortByPopularity(items = []) {
  return [...items].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
}

export async function GET(request, { params }) {
  const blocked = rejectCrossSiteRequest(request) || rejectIfRateLimited(request, 80);
  if (blocked) return blocked;

  const { id } = await params;
  const safeId = parseTmdbId(id);

  if (!safeId) {
    return protectedJson({ movies: [] }, { status: 400 });
  }

  try {
    const actor = await getActor(safeId);
    const movies = sortByPopularity(actor?.movie_credits?.cast ?? [])
      .slice(0, 3)
      .map((movie) => ({
        id: movie.id,
        title: movie.title ?? "Sin titulo",
        popularity: Math.round(movie.popularity ?? 0),
      }));

    return protectedJson({ movies });
  } catch {
    return protectedJson({ movies: [] }, { status: 500 });
  }
}
