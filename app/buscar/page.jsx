import ContenedorBusqueda from "@/components/ContenedorBusqueda";
import { fetchBusqueda } from "@/lib/Api_";
import TarjetaPeli from "@/components/TarjetaPeli";
import Image from "next/image";

export default async function Buscar({ searchParams }) {
  const { q } = await searchParams;
  const termino = Array.isArray(q) ? q[0] : q;
  const data = termino ? await fetchBusqueda(termino) : null;
  const resultados = data?.results ?? [];
  const fondo = resultados[0]?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${resultados[0].backdrop_path}`
    : null;

  return (
    <div className="space-y-5">
      {fondo && termino && (
        <section className="relative h-[32vh] overflow-hidden rounded-sm border border-white/10">
          <Image
            src={fondo}
            alt={`Fondo de resultados para ${termino}`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
          <div className="relative z-10 flex h-full items-end p-6">
            <h2 className="text-2xl font-black uppercase sm:text-4xl">
              Resultados para {termino}
            </h2>
          </div>
        </section>
      )}

      <ContenedorBusqueda />
      {termino ? (
        <>
          {resultados.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-2xl font-black uppercase tracking-wide">
                Peliculas encontradas
              </h3>
              <div className="movie-grid">
              {resultados.map((p) => (
                <div key={p.id} className="fade-up">
                  <TarjetaPeli
                    id={p.id}
                    titulo={p.title}
                    descripcion={p.overview}
                    rating={p.vote_average}
                    imagenPath={p.poster_path}
                    pelicula={p}
                    modo="grid"
                  />
                </div>
              ))}
              </div>
            </section>
          )}

          {resultados.length === 0 && (
            <div className="netflix-panel p-8 text-center">
              <p className="text-lg font-semibold uppercase text-white">
                No se encontraron peliculas para {termino}
              </p>
              <p className="mt-2 text-sm text-white/70">
                Prueba con otro titulo o usa una palabra mas corta.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="netflix-panel p-8 text-center">
          <p className="text-sm text-white/70">
            Escribe una busqueda para ver posters y trailers.
          </p>
        </div>
      )}
    </div>
  );
}
