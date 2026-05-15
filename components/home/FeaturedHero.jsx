import Image from "next/image";
import Link from "next/link";

export default function FeaturedHero({ principales = [] }) {
  const main = principales[0];
  const siguientes = principales.slice(1, 4);

  if (!main) return null;

  const mainBackdrop = main.backdrop_path
    ? `https://image.tmdb.org/t/p/original${main.backdrop_path}`
    : null;

  return (
    <section className="w-full text-white">
      <div className="relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-black p-4 lg:flex-row">
        <Link href={`/peli/${main.id}`} className="group relative h-[420px] flex-1 overflow-hidden rounded-2xl">
          {mainBackdrop ? (
            <Image
              src={mainBackdrop}
              alt={main.title}
              fill
              sizes="(max-width: 1024px) 100vw, 70vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute bottom-6 left-6 max-w-md">
            <h2 className="text-2xl font-bold lg:text-3xl">{main.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm text-gray-300">{main.overview || "Sin descripcion"}</p>
            <span className="mt-4 inline-flex rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold transition hover:bg-blue-500">
              Ver ficha
            </span>
          </div>
        </Link>

        <aside className="w-full rounded-2xl bg-zinc-900 p-4 lg:w-[340px]">
          <h3 className="mb-4 font-semibold text-blue-400">A continuacion</h3>
          <div className="flex flex-col gap-3">
            {siguientes.map((item) => {
              const thumb = item.backdrop_path
                ? `https://image.tmdb.org/t/p/w300${item.backdrop_path}`
                : null;
              return (
                <Link
                  key={item.id}
                  href={`/peli/${item.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-zinc-800"
                >
                  <div className="relative h-14 w-24 overflow-hidden rounded bg-zinc-800">
                    {thumb ? (
                      <Image src={thumb} alt={item.title} fill sizes="96px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
                    <span className="text-xs text-gray-400">Popularidad {Math.round(item.popularity ?? 0)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}

