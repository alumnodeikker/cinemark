import HomeMovies from "@/components/home/HomeMovies";
import { absoluteUrl } from "@/lib/seo";

export const metadata = {
  alternates: {
    canonical: absoluteUrl("/"),
  },
};

export default function Inicio() {
  return (
    <main className="mx-auto w-full max-w-[1220px] space-y-6 px-4 py-4 sm:px-6 lg:px-8">
      <HomeMovies />
    </main>
  );
}
