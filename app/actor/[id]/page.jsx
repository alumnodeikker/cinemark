import Image from "next/image";
import Link from "next/link";
import BotonFavoritoActor from "@/components/BotonFavoritoActor";
import { fetchActor } from "@/lib/Api_";

function sortByPopularity(items = []) {
  return [...items].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
}

export default async function ActorPage({ params }) {
  const { id } = await params;
  const actor = await fetchActor(id);

  if (!actor?.id) {
    return <main className="netflix-panel p-8">No se pudo cargar el actor.</main>;
  }

  const credits = sortByPopularity(actor?.movie_credits?.cast ?? []).slice(0, 20);
  const knownFor = credits.slice(0, 4);
  const profile = actor.profile_path
    ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
    : null;

  return (
    <main className="mx-auto w-full max-w-[1220px] space-y-6 px-4 py-4 text-white sm:px-6 lg:px-8">
      <section className="netflix-panel grid gap-6 p-5 lg:grid-cols-[260px_1fr]">
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-zinc-800">
          {profile ? (
            <Image src={profile} alt={actor.name} fill sizes="260px" className="object-cover" />
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black sm:text-4xl">{actor.name}</h1>
            <BotonFavoritoActor persona={actor} />
          </div>
          <p className="text-sm text-white/70">
            Popularidad: <span className="font-semibold text-white">{Math.round(actor.popularity ?? 0)}</span>
          </p>
          <p className="text-sm text-white/70">
            Nacimiento: <span className="font-semibold text-white">{actor.birthday || "N/D"}</span>
          </p>
          <p className="text-sm text-white/70">
            Lugar: <span className="font-semibold text-white">{actor.place_of_birth || "N/D"}</span>
          </p>
          <p className="text-sm leading-7 text-white/85">
            {actor.biography || "Biografia no disponible en TMDB para este actor."}
          </p>

          {knownFor.length > 0 ? (
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-blue-300">Conocido por</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {knownFor.map((movie) => (
                  <Link key={movie.id} href={`/peli/${movie.id}`} className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold hover:border-blue-300/40">
                    {movie.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="netflix-panel p-5">
        <h2 className="text-2xl font-black">Mas peliculas de {actor.name}</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {credits.map((movie) => {
            const poster = movie.poster_path
              ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
              : null;

            return (
              <Link key={`${movie.id}-${movie.credit_id}`} href={`/peli/${movie.id}`} className="group rounded-lg border border-white/10 bg-zinc-900 p-2 transition hover:bg-zinc-800">
                <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-zinc-800">
                  {poster ? (
                    <Image src={poster} alt={movie.title} fill sizes="180px" className="object-cover transition group-hover:scale-[1.03]" />
                  ) : null}
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-semibold">{movie.title}</p>
                <p className="text-xs text-white/65">{movie.character || "Sin personaje"}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

