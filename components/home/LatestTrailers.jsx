import Image from "next/image";
import Link from "next/link";

const FILTERS = ["Popular", "Retransmisión", "En televisión", "En alquiler", "En cines"];

function formatReleaseDate(date) {
  if (!date) return "Próximamente";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Próximamente";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
  }).format(parsed);
}
function buildYoutubeWatchUrl(key) {
  if (!key) return "#";
  return `https://www.youtube.com/watch?v=${key}`;
}

export default function LatestTrailers({ peliculas = [] }) {
  const conTrailer = peliculas.filter((movie) => Boolean(movie?.trailer_key));
  if (!conTrailer.length) return null;

  return (
    <section className="space-y-4 text-white">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Tráilers populares</h2>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                index === 0
                  ? "border-emerald-300 bg-emerald-300 text-black"
                  : "border-white/25 bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <article className="relative overflow-hidden rounded-sm border border-white/10 bg-[linear-gradient(180deg,rgba(11,31,53,0.9)_0%,rgba(7,10,15,0.95)_65%)] p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(79,140,255,0.2),transparent_35%)]" />

        <div className="poster-rail relative gap-4 pb-2">
          {conTrailer.map((movie) => {
            const backdropUrl = movie.backdrop_path
              ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
              : movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : null;

            return (
              <article key={movie.id} className="w-[300px] shrink-0 sm:w-[360px]">
                <a
                  href={buildYoutubeWatchUrl(movie.trailer_key)}
                  className="group block"
                  aria-label={`Ver tráiler de ${movie.title}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="relative aspect-video overflow-hidden rounded-sm border border-white/10 bg-zinc-900">
                    {backdropUrl ? (
                      <Image
                        src={backdropUrl}
                        alt={movie.title}
                        fill
                        sizes="(max-width: 640px) 300px, 360px"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-white/60">
                        Sin imagen
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                    <span className="absolute left-1/2 top-1/2 inline-flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/65 bg-black/45 text-white backdrop-blur-sm">
                      <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </div>

                  <div className="pt-3 text-center">
                    <p className="line-clamp-2 text-2xl font-black leading-tight text-white">
                      {movie.title}
                    </p>
                    <p className="mt-1 text-sm text-white/85">
                      Tráiler oficial · {formatReleaseDate(movie.release_date)}
                    </p>
                  </div>
                </a>
                <div className="pt-2 text-center">
                  <Link
                    href={`/peli/${movie.id}`}
                    className="inline-flex text-xs font-semibold text-blue-300 transition hover:text-blue-200"
                  >
                    Ver ficha
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </article>
    </section>
  );
}
