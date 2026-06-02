import MovieAssistantChat from "@/components/assistant/MovieAssistantChat";

export const metadata = {
  title: "Asistente de peliculas",
  description: "Chat para recomendar una pelicula usando favoritos, historial y seguimiento.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AsistentePage() {
  return (
    <main className="mx-auto w-full max-w-[1220px] space-y-6 px-4 py-4 text-white sm:px-6 lg:px-8">
      <section className="netflix-panel p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
          Recomendador
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase sm:text-4xl">
          Asistente de peliculas
        </h1>
        <p className="mt-2 text-sm text-white/70 sm:text-base">
          Pide una recomendacion directa y el bot elegira una pelicula para ver hoy.
        </p>
      </section>

      <MovieAssistantChat />
    </main>
  );
}
