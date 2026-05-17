import "server-only";

const WINDOW_MS = 60_000;
const buckets = new Map();

export const privateApiHeaders = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
  Vary: "Origin, Referer, Sec-Fetch-Site",
};

function sameOrigin(value, requestOrigin) {
  if (!value) return true;

  try {
    const origin = new URL(value).origin;
    const publicOrigin = process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin
      : requestOrigin;

    return origin === requestOrigin || origin === publicOrigin;
  } catch {
    return false;
  }
}

export function rejectCrossSiteRequest(request) {
  const requestOrigin = new URL(request.url).origin;
  const fetchSite = request.headers.get("sec-fetch-site");
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (
    fetchSite === "cross-site" ||
    !sameOrigin(origin, requestOrigin) ||
    !sameOrigin(referer, requestOrigin)
  ) {
    return Response.json(
      { error: "Solicitud no permitida" },
      { status: 403, headers: privateApiHeaders }
    );
  }

  return null;
}

export function rejectIfRateLimited(request, limit = 60) {
  const now = Date.now();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  const key = `${ip}:${new URL(request.url).pathname}`;
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return Response.json(
      { error: "Demasiadas solicitudes" },
      {
        status: 429,
        headers: {
          ...privateApiHeaders,
          "Retry-After": String(Math.ceil((bucket.resetAt - now) / 1000)),
        },
      }
    );
  }

  return null;
}

export function sanitizeSearchQuery(value, maxLength = 80) {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function parseTmdbId(value) {
  const id = String(value ?? "").trim();
  return /^\d{1,10}$/.test(id) ? id : null;
}

export function protectedJson(body, init = {}) {
  return Response.json(body, {
    ...init,
    headers: {
      ...privateApiHeaders,
      ...(init.headers ?? {}),
    },
  });
}
