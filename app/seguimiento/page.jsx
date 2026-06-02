import TrackedMovies from "@/components/favorites/TrackedMovies";

export const metadata = {
  title: "Seguimiento de estrenos",
  description: "Peliculas guardadas para recibir aviso cuando lleguen a cines.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SeguimientoPage() {
  return (
    <main className="space-y-6">
      <section className="netflix-panel p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
          Mi lista
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase sm:text-4xl">
          Seguimiento de estrenos
        </h1>
        <p className="mt-2 text-sm text-white/70 sm:text-base">
          Aqui aparecen las peliculas que marcaste con +. La app te avisa cuando llegue su fecha de estreno.
        </p>
      </section>

      <TrackedMovies />
    </main>
  );
}
