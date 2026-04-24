import Image from "next/image";
import Link from "next/link";
import BotonFavorito from "@/components/BotonFavorito";
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

function formatRating(value) {
  if (!value && value !== 0) return "N/D";
  return Number(value).toFixed(1);
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
  const genresList = peli.genres?.map((genre) => genre.name) ?? [];
  const genres = genresList.join(", ") || "N/D";
  const cast = peli.credits?.cast?.slice(0, 10) ?? [];
  const companies =
    peli.production_companies?.slice(0, 3).map((c) => c.name).join(", ") ||
    "N/D";
  const certification = pickCertification(peli.release_dates?.results ?? []);
  const galleryImages = Array.isArray(peli.images?.backdrops)
    ? peli.images.backdrops.slice(0, 7)
    : [];
  const galleryTotal = Array.isArray(peli.images?.backdrops)
    ? peli.images.backdrops.length
    : 0;
  const galleryRemaining = Math.max(galleryTotal - galleryImages.length, 0);
  const videosTotal = Array.isArray(peli.videos?.results)
    ? peli.videos.results.length
    : 0;
  const voteCount = peli.vote_count
    ? new Intl.NumberFormat("es-ES", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(peli.vote_count)
    : "0";
  const popularity = Math.round(peli.popularity ?? 0);

  const posterUrl = peli.poster_path
    ? `https://image.tmdb.org/t/p/w500${peli.poster_path}`
    : null;
  const backdropUrl = peli.backdrop_path
    ? `https://image.tmdb.org/t/p/original${peli.backdrop_path}`
    : null;
  const peliculaFavorita = {
    id: peli.id,
    title: peli.title ?? "",
    overview: peli.overview ?? "",
    vote_average: peli.vote_average ?? 0,
    poster_path: peli.poster_path ?? null,
  };

  return (
    <main className="mx-auto w-full max-w-[1220px] space-y-6 px-4 py-4 text-white sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#06080f] shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt={`Fondo de ${peli.title}`}
            fill
            priority
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,140,255,0.18),transparent_28%),linear-gradient(90deg,rgba(2,6,14,0.98)_0%,rgba(2,6,14,0.88)_28%,rgba(2,6,14,0.54)_58%,rgba(2,6,14,0.9)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#03060e] via-[#03060e]/20 to-black/30" />

        <div className="relative z-10 flex flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 space-y-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-white/72">
                <Link href="#cast" className="transition hover:text-white">
                  Elenco y equipo
                </Link>
                <span className="hidden text-white/30 xl:inline">•</span>
                <Link href="#fotos" className="transition hover:text-white">
                  Fotos
                </Link>
                <span className="hidden text-white/30 xl:inline">•</span>
                <Link href="#detalles" className="transition hover:text-white">
                  Ficha completa
                </Link>
                <span className="hidden text-white/30 xl:inline">•</span>
                <Link href="#trailer" className="transition hover:text-white">
                  Trailer
                </Link>
              </div>

              <div>
                <h1 className="max-w-3xl text-3xl font-black tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
                  {peli.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/72 sm:text-base">
                  <span>{year}</span>
                  <span className="h-1 w-1 rounded-full bg-blue-400/70" />
                  <span>{certification}</span>
                  <span className="h-1 w-1 rounded-full bg-blue-400/70" />
                  <span>{runtime}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:min-w-[500px]">
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
                  Calificacion
                </p>
                <p className="mt-1 text-2xl font-black text-amber-300">
                  {formatRating(peli.vote_average)}/10
                </p>
                <p className="text-xs text-white/55">{voteCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
                  Tu calificacion
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex justify-center">
                    <BotonFavorito pelicula={peliculaFavorita} />
                  </div>
                  <span className="text-sm font-semibold text-blue-300">Calificar</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
                  Popularidad
                </p>
                <p className="mt-1 text-2xl font-black text-white">{popularity}</p>
                <p className="text-xs text-white/55">hoy</p>
              </div>
            </div>
          </div>

          <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(280px,320px)_minmax(0,1fr)_220px]">
            <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-black/35 shadow-[0_22px_55px_rgba(0,0,0,0.35)]">
              <div className="relative min-h-[360px] h-full sm:min-h-[460px] xl:min-h-[520px]">
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={peli.title}
                    fill
                    sizes="(max-width: 1280px) 40vw, 320px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-neutral-900 text-sm text-white/45">
                    Sin poster
                  </div>
                )}
              </div>
            </div>

            <div
              id="trailer"
              className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/30"
            >
              {trailerUrl ? (
                <div className="flex h-full min-h-[360px] flex-col sm:min-h-[460px] xl:min-h-[520px]">
                  <div className="min-h-[240px] flex-1 overflow-hidden sm:min-h-[300px]">
                    <iframe
                      src={trailerUrl}
                      title={`Trailer de ${peli.title}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-4 border-t border-white/10 bg-black/55 p-5 sm:p-6">
                    <div className="flex flex-wrap gap-2">
                      {genresList.slice(0, 6).map((genre) => (
                        <span
                          key={genre}
                          className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-semibold text-white/80"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    <p className="max-w-3xl text-sm leading-7 text-white/82 sm:text-base">
                      {peli.overview || "Esta pelicula no tiene descripcion disponible."}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/30 px-5 py-3 text-sm font-semibold text-white transition hover:border-blue-300/40 hover:bg-white/8"
                      >
                        Volver al inicio
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative min-h-[360px] sm:min-h-[460px] xl:min-h-[520px]">
                  {backdropUrl && (
                    <Image
                      src={backdropUrl}
                      alt={`Escena de ${peli.title}`}
                      fill
                      sizes="(max-width: 1280px) 100vw, 900px"
                      className="object-cover opacity-45"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/50" />
                  <div className="relative flex min-h-[280px] flex-col justify-end gap-4 p-5 sm:p-6">
                    <div className="flex flex-wrap gap-2">
                      {genresList.slice(0, 6).map((genre) => (
                        <span
                          key={genre}
                          className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-semibold text-white/80"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                    <p className="max-w-3xl text-sm leading-7 text-white/82 sm:text-base">
                      {peli.overview || "Esta pelicula no tiene descripcion disponible."}
                    </p>
                    <p className="text-sm text-white/70">
                      Esta pelicula no tiene trailer disponible.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="flex min-h-[248px] flex-col items-center justify-center rounded-[1.35rem] border border-white/10 bg-white/6 px-5 py-4 text-center backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/55">
                  Videos
                </p>
                <p className="mt-3 text-3xl font-black text-white">{videosTotal}</p>
                <p className="mt-1 text-sm text-white/65">
                  {trailerUrl ? "trailer y clips" : "sin videos"}
                </p>
              </div>
              <div className="flex min-h-[248px] flex-col items-center justify-center rounded-[1.35rem] border border-white/10 bg-white/6 px-5 py-4 text-center backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/55">
                  Fotos
                </p>
                <p className="mt-3 text-3xl font-black text-white">{galleryTotal}</p>
                <p className="mt-1 text-sm text-white/65">imagenes disponibles</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-white/10 pt-5">
            <div className="w-full rounded-[1.35rem] border border-white/10 bg-black/25 p-4 sm:max-w-[260px]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
                En cartelera
              </p>
              <p className="mt-3 text-lg font-bold text-white">{peli.status || "Disponible"}</p>
              <p className="mt-2 text-sm text-white/65">{formatMoney(peli.revenue)} de recaudacion</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        <article id="detalles" className="netflix-panel p-4 sm:p-5">
          <h2 className="text-2xl font-black uppercase">Informacion importante</h2>

          <dl className="mt-4 grid w-full grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-white/60">Fecha estreno</dt>
              <dd className="font-semibold">{peli.release_date || "N/D"}</dd>
            </div>
            <div>
              <dt className="text-white/60">Rating</dt>
              <dd className="font-semibold">{formatRating(peli.vote_average)} / 10</dd>
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
        </article>

        <article id="cast" className="netflix-panel p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="h-7 w-1 rounded-full bg-amber-400" />
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black">Elenco principal</h2>
                <span className="text-sm font-semibold text-white/55">99+</span>
              </div>
            </div>
            <span className="text-sm font-medium text-white/55">Editar</span>
          </div>

          {cast.length > 0 ? (
            <div className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-2">
              {cast.map((actor) => {
                const profile = actor.profile_path
                  ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                  : null;

                return (
                  <div
                    key={`${actor.id}-${actor.cast_id}`}
                    className="group flex items-center gap-4 rounded-[1.4rem] border border-white/8 bg-white/4 px-3 py-3 transition hover:border-blue-300/25 hover:bg-white/7"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-white/10 bg-neutral-800 sm:h-24 sm:w-24">
                      {profile ? (
                        <Image
                          src={profile}
                          alt={actor.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[11px] text-white/55">
                          Sin foto
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-lg font-bold text-white">
                        {actor.name}
                      </p>
                      <p className="line-clamp-1 text-base text-white/65">
                        {actor.character || "Sin personaje"}
                      </p>
                    </div>

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white/70 transition group-hover:border-blue-300/35 group-hover:text-blue-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                      >
                        <path d="M12 21s-6.7-4.35-9.33-8.08C.93 10.43 2.3 6.5 5.93 5.2c2.28-.82 4.3.04 6.07 2.1 1.77-2.06 3.8-2.92 6.07-2.1 3.63 1.3 5 5.23 3.26 7.72C18.7 16.65 12 21 12 21Z" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/65">No hay reparto disponible.</p>
          )}
        </article>
      </section>

      {galleryImages.length > 0 && (
        <section id="fotos" className="netflix-panel p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="h-7 w-1 rounded-full bg-amber-400" />
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black">Fotos</h2>
                <span className="text-sm font-semibold text-white/55">
                  {galleryTotal}
                </span>
              </div>
            </div>
            <span className="text-sm font-medium text-blue-300">Agregar foto</span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12">
            {galleryImages.map((image, index) => {
              const imageUrl = image.file_path
                ? `https://image.tmdb.org/t/p/w780${image.file_path}`
                : null;

              if (!imageUrl) return null;

              const spanClass =
                index === 0
                  ? "xl:col-span-5"
                  : index === 1
                    ? "xl:col-span-3"
                    : index === 2
                      ? "xl:col-span-4"
                      : index === 3
                        ? "xl:col-span-3"
                        : index === 4
                          ? "xl:col-span-3"
                          : index === 5
                            ? "xl:col-span-4"
                            : "xl:col-span-2";

              const showRemaining = index === galleryImages.length - 1 && galleryRemaining > 0;

              return (
                <div
                  key={`${image.file_path}-${index}`}
                  className={`group relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-black/30 ${spanClass}`}
                >
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={imageUrl}
                      alt={`Imagen ${index + 1} de ${peli.title}`}
                      fill
                      sizes="(max-width: 1280px) 100vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                    {showRemaining && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                        <span className="text-3xl font-black text-white">
                          +{galleryRemaining}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

    </main>
  );
}
