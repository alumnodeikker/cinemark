import Image from "next/image";
import Link from "next/link";
import { buildYoutubeEmbedUrl, fetchPeli } from "@/lib/Api_";

function pickYoutubeTrailer(videos = []) {
  if (!Array.isArray(videos) || videos.length === 0) return null;

  return (
    videos.find(
      (video) =>
        video?.site === "YouTube" &&
        video?.type === "Trailer" &&
        video?.official === true
    ) ||
    videos.find(
      (video) => video?.site === "YouTube" && video?.type === "Trailer"
    ) ||
    videos.find((video) => video?.site === "YouTube") ||
    null
  );
}

function formatRuntime(minutes) {
  if (!minutes || Number.isNaN(Number(minutes))) return "N/D";
  const total = Number(minutes);
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function formatMoney(value) {
  if (!value || Number(value) <= 0) return "N/D";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function pickCertification(results = []) {
  const priority = ["ES", "US"];

  for (const country of priority) {
    const entry = results.find((item) => item?.iso_3166_1 === country);
    const cert =
      entry?.release_dates?.find((date) => Boolean(date?.certification))
        ?.certification ?? "";
    if (cert) return cert;
  }

  return "N/D";
}

export default async function FichaPelicula({ params }) {
  const { vin } = await params;
  const peli = await fetchPeli(vin);

  if (!peli?.id) {
    return (
      <main className="netflix-panel p-8 text-white">
        No se pudo cargar esta pelicula.
      </main>
    );
  }

  const trailer = pickYoutubeTrailer(peli?.videos?.results);
  const trailerUrl = buildYoutubeEmbedUrl(trailer?.key);
  const year = peli.release_date?.split("-")?.[0] ?? "N/D";
  const match = Math.round((peli.vote_average ?? 0) * 10);
  const runtime = formatRuntime(peli.runtime);
  const genres = peli.genres?.map((genre) => genre.name).join(", ") || "N/D";
  const cast = peli.credits?.cast?.slice(0, 10) ?? [];
  const companies =
    peli.production_companies?.slice(0, 3).map((c) => c.name).join(", ") ||
    "N/D";
  const certification = pickCertification(peli.release_dates?.results ?? []);

  const posterUrl = peli.poster_path
    ? `https://image.tmdb.org/t/p/w500${peli.poster_path}`
    : null;
  const backdropUrl = peli.backdrop_path
    ? `https://image.tmdb.org/t/p/original${peli.backdrop_path}`
    : null;

  return (
    <main className="space-y-5 text-white">
      <section className="relative min-h-[58vh] overflow-hidden rounded-sm border border-white/10">
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt={`Fondo de ${peli.title}`}
            fill
            priority
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

        <div className="relative z-10 flex h-full max-w-2xl flex-col justify-end gap-4 p-5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
            Ficha completa
          </p>
          <h1 className="text-4xl font-black uppercase leading-tight sm:text-6xl">
            {peli.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base">
            <span className="font-bold text-emerald-400">{match}% de coincidencia</span>
            <span>{year}</span>
            <span>{runtime}</span>
            <span className="rounded-sm border border-white/25 px-2 py-0.5 text-xs">
              {certification}
            </span>
          </div>

          <p className="max-w-xl text-sm text-white/85 sm:text-base">{peli.overview}</p>

          <div className="flex flex-wrap gap-3">
            {trailerUrl && (
              <a
                href="#trailer"
                className="rounded-sm bg-white px-5 py-2 text-sm font-bold text-black hover:bg-white/90"
              >
                Ver trailer
              </a>
            )}
            <Link
              href="/"
              className="rounded-sm border border-white/40 bg-white/10 px-5 py-2 text-sm font-semibold text-white hover:bg-white/20"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        <article className="netflix-panel p-4 sm:p-5">
          <h2 className="text-2xl font-black uppercase">Informacion importante</h2>

          <div className="mt-4 flex gap-4">
            <div className="relative hidden w-36 flex-shrink-0 overflow-hidden rounded-sm border border-white/10 sm:block">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={peli.title}
                  width={220}
                  height={330}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[220px] items-center justify-center bg-neutral-800 text-sm text-white/50">
                  Sin poster
                </div>
              )}
            </div>

            <dl className="grid w-full grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-white/60">Fecha estreno</dt>
                <dd className="font-semibold">{peli.release_date || "N/D"}</dd>
              </div>
              <div>
                <dt className="text-white/60">Rating</dt>
                <dd className="font-semibold">
                  {peli.vote_average?.toFixed?.(1) ?? "N/D"} / 10
                </dd>
              </div>
              <div>
                <dt className="text-white/60">Duracion</dt>
                <dd className="font-semibold">{runtime}</dd>
              </div>
              <div>
                <dt className="text-white/60">Generos</dt>
                <dd className="font-semibold">{genres}</dd>
              </div>
              <div>
                <dt className="text-white/60">Idioma original</dt>
                <dd className="font-semibold uppercase">
                  {peli.original_language || "N/D"}
                </dd>
              </div>
              <div>
                <dt className="text-white/60">Estado</dt>
                <dd className="font-semibold">{peli.status || "N/D"}</dd>
              </div>
              <div>
                <dt className="text-white/60">Presupuesto</dt>
                <dd className="font-semibold">{formatMoney(peli.budget)}</dd>
              </div>
              <div>
                <dt className="text-white/60">Recaudacion</dt>
                <dd className="font-semibold">{formatMoney(peli.revenue)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-white/60">Productoras</dt>
                <dd className="font-semibold">{companies}</dd>
              </div>
            </dl>
          </div>
        </article>

        <article className="netflix-panel p-4 sm:p-5">
          <h2 className="text-2xl font-black uppercase">Actores principales</h2>

          {cast.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {cast.map((actor) => {
                const profile = actor.profile_path
                  ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                  : null;

                return (
                  <div
                    key={`${actor.id}-${actor.cast_id}`}
                    className="rounded-sm border border-white/10 bg-black/35 p-2"
                  >
                    <div className="relative mb-2 aspect-[3/4] overflow-hidden rounded-sm bg-neutral-800">
                      {profile ? (
                        <Image
                          src={profile}
                          alt={actor.name}
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[11px] text-white/55">
                          Sin foto
                        </div>
                      )}
                    </div>
                    <p className="line-clamp-1 text-xs font-bold">{actor.name}</p>
                    <p className="line-clamp-1 text-[11px] text-white/65">
                      {actor.character || "Sin personaje"}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/65">No hay reparto disponible.</p>
          )}
        </article>
      </section>

      {trailerUrl ? (
        <section id="trailer" className="netflix-panel overflow-hidden p-3">
          <h2 className="px-1 pb-3 text-2xl font-black uppercase">Trailer oficial</h2>
          <iframe
            src={trailerUrl}
            title={`Trailer de ${peli.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="aspect-video w-full rounded-sm"
          />
        </section>
      ) : (
        <section className="netflix-panel p-5">
          <p className="text-sm text-white/70">Esta pelicula no tiene trailer disponible.</p>
        </section>
      )}
    </main>
  );
}
