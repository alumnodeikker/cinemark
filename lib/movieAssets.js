export function tmdbPoster(path, size = "w500") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

export function tmdbBackdrop(path, size = "w780") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

export function movieInitial(title = "C") {
  return String(title || "C").trim().charAt(0).toUpperCase() || "C";
}
