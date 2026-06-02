import { getTrendingMoviesForRegion } from "@/lib/tmdb";
import {
  protectedJson,
  rejectCrossSiteRequest,
  rejectIfRateLimited,
} from "@/lib/apiProtection";

function sanitizeCountryCode(value) {
  const code = String(value || "ES").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : "ES";
}

export async function GET(request) {
  const blocked = rejectCrossSiteRequest(request) || rejectIfRateLimited(request, 60);
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const countryCode = sanitizeCountryCode(searchParams.get("countryCode"));
  const movies = await getTrendingMoviesForRegion(countryCode);

  return protectedJson({ countryCode, movies });
}
