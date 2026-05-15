const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const siteConfig = {
  name: "Cinemark",
  url: siteUrl,
  description: "Descubre peliculas, trailers, elenco, imagenes y favoritos.",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export function tmdbImage(path, size = "w780") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

export function compactDescription(text, fallback = siteConfig.description) {
  const clean = text?.replace(/\s+/g, " ").trim();
  if (!clean) return fallback;
  return clean.length > 155 ? `${clean.slice(0, 152)}...` : clean;
}
