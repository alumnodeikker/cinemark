import { getNearbyCinemas } from "@/lib/cinemasService";
import { NextResponse } from "next/server";

/**
 * GET /api/cinemas/nearby
 * Query params:
 * - latitude: número
 * - longitude: número
 * - countryCode: string
 * - radius: número (default: 15)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const latitude = parseFloat(searchParams.get("latitude"));
    const longitude = parseFloat(searchParams.get("longitude"));
    const countryCode = searchParams.get("countryCode") || "ES";
    const radius = parseFloat(searchParams.get("radius")) || 15;

    // Validar parámetros
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: "Parámetros latitude y longitude requeridos" },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: "Coordenadas inválidas" },
        { status: 400 }
      );
    }

    // Obtener cines cercanos
    const result = await getNearbyCinemas(latitude, longitude, countryCode, radius);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Cachear respuesta por 1 hora
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Error en /api/cinemas/nearby:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
