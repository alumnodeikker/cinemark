import { absoluteUrl } from "@/lib/seo";
import { getPopularMovies, getUpcomingMoviesWithTrailers } from "@/lib/tmdb";

export default async function sitemap() {
  const now = new Date();
  const [popular, upcoming] = await Promise.all([
    getPopularMovies(),
    getUpcomingMoviesWithTrailers(),
  ]);
  const movies = [...popular, ...upcoming]
    .filter((movie, index, list) => movie?.id && list.findIndex((item) => item.id === movie.id) === index)
    .slice(0, 40);

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/populares"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...movies.map((movie) => ({
      url: absoluteUrl(`/peli/${movie.id}`),
      lastModified: movie.release_date ? new Date(`${movie.release_date}T00:00:00`) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    })),
  ];
}
