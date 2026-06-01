"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import { MapPin, X, AlertCircle, Loader } from "lucide-react";

/**
 * Banner para solicitar permiso de geolocalización (RGPD compliant)
 * Se muestra UNA SOLA VEZ cuando el usuario visita por primera vez
 * No se vuelve a mostrar hasta que el usuario lo resetee desde ajustes
 */
export function GeolocationBanner() {
  const { shouldShowBanner, requestGeolocation, rejectGeolocation, loading } =
    useGeolocation();

  // Solo mostrar si es la primera vez (not_configured)
  if (!shouldShowBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg z-50 p-4">
      <div className="max-w-6xl mx-auto flex items-start gap-4">
        <div className="flex items-start gap-3 flex-1">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              ¿Quieres ver qué cines cercanos proyectan esta película?
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Te mostraremos los cines más cercanos con sesiones, horarios y formatos disponibles. Podrás comprar entradas directamente.
            </p>
            <div className="flex items-start gap-2 mt-2 text-xs text-gray-500">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                Si aceptas, guardamos tu ubicación solo en este navegador durante 24 horas para encontrar cines cercanos. No se envía a nuestro servidor para almacenarla.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={requestGeolocation}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {loading ? "Detectando..." : "Activar ubicación"}
          </button>
          <button
            onClick={rejectGeolocation}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
