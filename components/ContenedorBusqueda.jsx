import BarraBusqueda from "./BarraBusqueda";

export default function ContenedorBusqueda() {
  return (
    <section className="netflix-panel relative overflow-hidden p-5 sm:p-7">
      <div className="pointer-events-none absolute -left-14 -top-14 h-36 w-36 rounded-full bg-blue-700/20 blur-2xl" />
      <div className="relative z-10 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">Buscar</p>
        <h1 className="text-2xl font-black uppercase text-white sm:text-4xl">
          Encuentra tu pelicula favorita
        </h1>
        <p className="max-w-2xl text-sm text-white/72 sm:text-base">
          Escribe un titulo y abre su ficha para ver fecha, rating, duracion, actores y trailer.
        </p>
        <BarraBusqueda />
      </div>
    </section>
  );
}
