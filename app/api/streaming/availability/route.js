import { getStreamingAvailability } from "@/lib/streamingService";
import { NextResponse } from "next/server";

/**
 * GET /api/streaming/availability
 * Query params:
 * - movieId: número
 * - countryCode: string (default: 'ES')
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const movieId = searchParams.get("movieId");
    const countryCode = searchParams.get("countryCode") || "ES";
    const movieTitle = searchParams.get("movieTitle") || "";

    if (!movieId) {
      return NextResponse.json(
        { error: "Parámetro movieId requerido" },
        { status: 400 }
      );
    }

    // Obtener disponibilidad de streaming
    const result = await getStreamingAvailability(movieId, countryCode, movieTitle);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Cachear respuesta por 24 horas
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=172800",
      },
    });
  } catch (error) {
    console.error("Error en /api/streaming/availability:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
