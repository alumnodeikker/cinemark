import { getTrailerKey } from "@/lib/tmdb";
import {
  parseTmdbId,
  protectedJson,
  rejectCrossSiteRequest,
  rejectIfRateLimited,
} from "@/lib/apiProtection";

export async function GET(request, { params }) {
  const blocked = rejectCrossSiteRequest(request) || rejectIfRateLimited(request, 80);
  if (blocked) return blocked;

  const { id } = await params;
  const safeId = parseTmdbId(id);

  if (!safeId) {
    return protectedJson({ key: null }, { status: 400 });
  }

  try {
    const key = await getTrailerKey(safeId);
    return protectedJson({ key });
  } catch {
    return protectedJson({ key: null }, { status: 500 });
  }
}
