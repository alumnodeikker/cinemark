import HomeMovies from "@/components/home/HomeMovies";
import { absoluteUrl } from "@/lib/seo";

export const metadata = {
  title: "Peliculas populares",
  description: "Explora peliculas populares, estrenos, trailers y tendencias de cine.",
  alternates: {
    canonical: absoluteUrl("/populares"),
  },
};

export default function Populares() {
  return (
    <main className="space-y-6">
      <HomeMovies />
    </main>
  );
}
