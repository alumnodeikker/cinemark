import FavoriteActors from "@/components/favorites/FavoriteActors";

export const metadata = {
  title: "Mis actores favoritos",
  description: "Tu lista local de actores favoritos.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MisActoresPage() {
  return (
    <main className="space-y-6">
      <section className="netflix-panel p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
          Mi elenco
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase sm:text-4xl">
          Mis actores favoritos
        </h1>
        <p className="mt-2 text-sm text-white/70 sm:text-base">
          Sigue a tus actores favoritos y explora en que peliculas aparecen.
        </p>
      </section>
      <FavoriteActors />
    </main>
  );
}
