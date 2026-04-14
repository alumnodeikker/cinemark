import ContenedorFavoritas from "@/components/ContenedorFavoritas";

export default function Mis_favo() {
  return (
    <main className="space-y-6">
      <section className="netflix-panel p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
          Mi lista
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase sm:text-4xl">
          Mis favoritos
        </h1>
        <p className="mt-2 text-sm text-white/70 sm:text-base">
          Guarda peliculas y abre su ficha completa con reparto y trailer.
        </p>
      </section>
      <ContenedorFavoritas />
    </main>
  );
}
