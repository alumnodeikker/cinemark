export default function SearchIntro() {
  return (
    <section className="netflix-panel relative overflow-hidden p-5 sm:p-7">
      <div className="relative z-10 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">Buscar</p>
        <h1 className="text-2xl font-black uppercase text-white sm:text-4xl">
          Encuentra tu pelicula favorita
        </h1>
        <p className="max-w-2xl text-sm text-white/72 sm:text-base">
          Usa la barra principal para buscar peliculas y abre su ficha para ver fecha, rating, actores y trailer.
        </p>
      </div>
    </section>
  );
}
