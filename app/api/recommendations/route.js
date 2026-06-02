import { getRecommendedMoviesForUser } from "@/lib/tmdb";
import {
  protectedJson,
  rejectCrossSiteRequest,
  rejectIfRateLimited,
} from "@/lib/apiProtection";

const MAX_ITEMS = 30;

function normalizeMovieList(value) {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, MAX_ITEMS)
    .map((movie) => ({
      id: Number(movie?.id),
      title: String(movie?.title ?? "").slice(0, 160),
      overview: String(movie?.overview ?? "").slice(0, 800),
      vote_average: Number(movie?.vote_average ?? 0),
      poster_path: movie?.poster_path ?? null,
      backdrop_path: movie?.backdrop_path ?? null,
      release_date: String(movie?.release_date ?? "").slice(0, 10),
      genre_ids: Array.isArray(movie?.genre_ids)
        ? movie.genre_ids.map(Number).filter(Number.isFinite).slice(0, 8)
        : [],
    }))
    .filter((movie) => Number.isFinite(movie.id));
}

export async function POST(request) {
  const blocked = rejectCrossSiteRequest(request) || rejectIfRateLimited(request, 25);
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const recommendations = await getRecommendedMoviesForUser(
      {
        favorites: normalizeMovieList(body?.favorites),
        watchlist: normalizeMovieList(body?.watchlist),
        viewedHistory: normalizeMovieList(body?.viewedHistory),
      },
      12
    );

    return protectedJson({ recommendations });
  } catch (error) {
    console.error("Error en /api/recommendations:", error);
    return protectedJson({ recommendations: [] }, { status: 500 });
  }
}
