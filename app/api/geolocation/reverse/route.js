import { getCountryFromCoordinates } from "@/lib/geolocation";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get("latitude"));
    const longitude = parseFloat(searchParams.get("longitude"));

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return NextResponse.json(
        { error: "Parámetros latitude y longitude requeridos" },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: "Coordenadas inválidas" }, { status: 400 });
    }

    const country = await getCountryFromCoordinates(latitude, longitude);

    return NextResponse.json(country || { countryCode: "ES", countryName: "España" }, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Error en /api/geolocation/reverse:", error);
    return NextResponse.json(
      { countryCode: "ES", countryName: "España" },
      { status: 200, headers: { "Cache-Control": "private, no-store" } }
    );
  }
}
