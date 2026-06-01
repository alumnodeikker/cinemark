"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import { MapPin } from "lucide-react";

/**
 * Badge discreto para mostrar estado de ubicación
 * Se puede mostrar en header, sidebar, etc.
 */
export function LocationBadge() {
  const { isAllowed, isDenied, resetLocationChoice, loading } = useGeolocation();

  // No mostrar si ya está configurado correctamente
  if (isAllowed) {
    return null;
  }

  // Si está denegado o no configurado, mostrar botón para cambiar
  return (
    <button
      onClick={resetLocationChoice}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
      title="Cambiar preferencia de ubicación"
    >
      <MapPin className="w-3.5 h-3.5" />
      {isDenied ? "Activar ubicación" : "Configurar ubicación"}
    </button>
  );
}
