import Image from "next/image";
import Link from "next/link";

export default function Top10Grid({ peliculas = [] }) {
  const top = peliculas.slice(0, 10);

  return (
    <section className="netflix-panel px-4 py-8 text-white">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
        <span className="h-6 w-1 bg-blue-600" />
        Mejores 10 peliculas de la semana
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        {top.slice(0, 3).map((item, idx) => {
          const poster = item.poster_path
            ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
            : null;
          return (
            <Link
              key={item.id}
              href={`/peli/${item.id}`}
              className="grid grid-cols-[88px_1fr] gap-4 rounded-xl border border-white/10 bg-zinc-900 p-3 transition hover:bg-zinc-800"
            >
              <div className="relative h-[132px] w-[88px] overflow-hidden rounded-lg bg-zinc-800">
                {poster ? (
                  <Image src={poster} alt={item.title} fill sizes="88px" className="object-cover" />
                ) : null}
              </div>
              <div>
                <span className="rounded bg-blue-600 px-2 py-1 text-xs font-bold">#{idx + 1}</span>
                <h3 className="mt-2 line-clamp-2 font-semibold">{item.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-gray-400">{item.overview || "Sin descripcion"}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-7">
        {top.slice(3).map((item, i) => {
          const poster = item.poster_path
            ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
            : null;
          const rank = i + 4;
          return (
            <Link
              key={item.id}
              href={`/peli/${item.id}`}
              className="rounded-lg border border-white/10 bg-zinc-900 p-2 transition hover:bg-zinc-800"
            >
              <div className="relative h-40 w-full overflow-hidden rounded-md bg-zinc-800">
                {poster ? (
                  <Image src={poster} alt={item.title} fill sizes="160px" className="object-cover" />
                ) : null}
                <span className="absolute left-1 top-1 rounded bg-blue-600 px-2 py-0.5 text-xs font-bold">#{rank}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-center text-xs">{item.title}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

