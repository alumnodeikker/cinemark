import { getNearbyCinemas, getPopularCinemaLinks } from "@/lib/cinemasService";
import { getStreamingAvailability } from "@/lib/streamingService";
import { getCinemaMoviesForRegion, getMoviesByWatchMode } from "@/lib/tmdb";
import { NextResponse } from "next/server";

function validCoordinate(value, min, max) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
}

function normalizeMode(value) {
  if (["popular", "streaming", "tv", "rent", "cinema"].includes(value)) {
    return value;
  }
  return "popular";
}

async function attachStreamingLinks(movies, countryCode, wantedTypes = []) {
  const enriched = await Promise.all(
    movies.map(async (movie) => {
      const availability = await getStreamingAvailability(movie.id, countryCode, movie.title);
      const providers = availability.success
        ? availability.data.filter((provider) =>
            wantedTypes.length ? wantedTypes.includes(provider.access_type) : true
          )
        : [];

      return {
        ...movie,
        availability: {
          type: "streaming",
          countryCode,
          providers: providers.slice(0, 4),
          source: availability.source,
        },
      };
    })
  );

  return enriched.filter((movie) => movie.availability.providers.length > 0);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = normalizeMode(searchParams.get("mode"));
    const countryCode = String(searchParams.get("countryCode") || "ES").toUpperCase();
    const region = searchParams.get("region") || "";
    const latitude = validCoordinate(searchParams.get("latitude"), -90, 90);
    const longitude = validCoordinate(searchParams.get("longitude"), -180, 180);

    if (mode === "popular") {
      return NextResponse.json({ data: [], mode });
    }

    if (mode === "cinema") {
      const movies = await getCinemaMoviesForRegion(countryCode);
      let nearbyCinemas = [];

      if (latitude != null && longitude != null) {
        const cinemas = await getNearbyCinemas(latitude, longitude, countryCode, 20);
        nearbyCinemas = cinemas.success ? cinemas.data.slice(0, 5) : [];
      } else {
        const fallback = getPopularCinemaLinks(countryCode, region);
        nearbyCinemas = fallback.data;
      }

      return NextResponse.json(
        {
          data: movies.map((movie) => ({
            ...movie,
            availability: {
              type: "cinema",
              countryCode,
              cinemas: nearbyCinemas,
              source: latitude != null && longitude != null ? "OpenStreetMap Overpass" : "Official cinema links",
            },
          })),
          mode,
        },
        { headers: { "Cache-Control": "private, no-store" } }
      );
    }

    const tmdbMode = mode === "rent" ? "rent" : mode;
    const movies = await getMoviesByWatchMode(tmdbMode, countryCode);
    const typesByMode = {
      streaming: ["subscription"],
      tv: ["free", "ads"],
      rent: ["rent", "buy"],
    };

    const data = await attachStreamingLinks(movies, countryCode, typesByMode[mode]);

    return NextResponse.json(
      { data, mode },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error("Error en /api/trailers/availability:", error);
    return NextResponse.json(
      { error: "No pudimos cargar esta categoría" },
      { status: 500 }
    );
  }
}
