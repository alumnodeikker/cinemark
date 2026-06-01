import { getCountryFromIP } from "@/lib/geolocation";
import { NextResponse } from "next/server";

/**
 * GET /api/geolocation/country
 * Obtiene el país del usuario desde su IP
 */
export async function GET(request) {
  try {
    const country = await getCountryFromIP();

    return NextResponse.json(country, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=172800",
      },
    });
  } catch (error) {
    console.error("Error en /api/geolocation/country:", error);
    return NextResponse.json(
      {
        countryCode: "ES",
        countryName: "España",
      },
      { status: 500 }
    );
  }
}
