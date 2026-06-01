"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import { MapPin, Check, X, AlertCircle } from "lucide-react";

/**
 * Card informativa sobre el estado de ubicación
 * Se puede mostrar en la página de cartelera/populares
 */
export function LocationStatusCard() {
  const { isAllowed, isDenied, preference, resetLocationChoice, loading } =
    useGeolocation();

  if (preference === "not_configured") {
    return null; // El banner ya lo maneja
  }

  return (
    <div className={`rounded-lg p-4 border ${
      isAllowed 
        ? "bg-green-50 border-green-200" 
        : "bg-red-50 border-red-200"
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {isAllowed ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <X className="w-5 h-5 text-red-600" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${
            isAllowed ? "text-green-900" : "text-red-900"
          }`}>
            {isAllowed 
              ? "Ubicación activada" 
              : "Ubicación desactivada"}
          </h3>
          <p className={`text-sm mt-1 ${
            isAllowed ? "text-green-800" : "text-red-800"
          }`}>
            {isAllowed
              ? "Estamos mostrando cines cercanos para cada película según tu ubicación."
              : "No estamos mostrando cines cercanos. Puedes activar la ubicación para verlos."}
          </p>
        </div>
      </div>

      <button
        onClick={resetLocationChoice}
        disabled={loading}
        className={`mt-3 px-3 py-1.5 rounded text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
          isAllowed
            ? "bg-green-200 text-green-800 hover:bg-green-300"
            : "bg-red-200 text-red-800 hover:bg-red-300"
        }`}
      >
        <MapPin className="w-4 h-4 inline mr-1" />
        {isAllowed ? "Cambiar" : "Activar ahora"}
      </button>
    </div>
  );
}
