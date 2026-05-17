import { searchMovies } from "@/lib/tmdb";
import {
  protectedJson,
  rejectCrossSiteRequest,
  rejectIfRateLimited,
  sanitizeSearchQuery,
} from "@/lib/apiProtection";

export async function GET(request) {
  const blocked = rejectCrossSiteRequest(request) || rejectIfRateLimited(request, 50);
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const q = sanitizeSearchQuery(searchParams.get("q"));

  if (q.length < 2) {
    return protectedJson({ results: [] });
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

  return protectedJson({ results });
}
