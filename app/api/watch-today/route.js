import { getWatchTodayMovie } from "@/lib/tmdb";
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

function normalizeContext(value) {
  const hour = Number(value?.hour);
  const day = Number(value?.day);
  const variant = Number(value?.variant);

  return {
    hour: Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : new Date().getHours(),
    day: Number.isInteger(day) && day >= 0 && day <= 6 ? day : new Date().getDay(),
    date: String(value?.date ?? new Date().toISOString().slice(0, 10)).slice(0, 10),
    variant: Number.isInteger(variant) && variant >= 0 && variant <= 50 ? variant : 0,
  };
}

export async function POST(request) {
  const blocked = rejectCrossSiteRequest(request) || rejectIfRateLimited(request, 30);
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const movie = await getWatchTodayMovie(
      {
        favorites: normalizeMovieList(body?.favorites),
        watchlist: normalizeMovieList(body?.watchlist),
        viewedHistory: normalizeMovieList(body?.viewedHistory),
      },
      normalizeContext(body?.context)
    );

    return protectedJson({ movie });
  } catch (error) {
    console.error("Error en /api/watch-today:", error);
    return protectedJson({ movie: null }, { status: 500 });
  }
}
