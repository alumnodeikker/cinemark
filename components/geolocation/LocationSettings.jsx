"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import { MapPin, RotateCcw } from "lucide-react";

/**
 * Componente para ajustes de ubicación
 * Permite al usuario cambiar su decisión de geolocalización
 */
export function LocationSettings() {
  const { preference, resetLocationChoice, isAllowed, isDenied } = useGeolocation();

  const getStatusText = () => {
    if (isAllowed) {
      return "Ubicación activada - Mostrando cines cercanos";
    }
    if (isDenied) {
      return "Ubicación desactivada - No se mostrarán cines cercanos";
    }
    return "No configurado";
  };

  const getStatusColor = () => {
    if (isAllowed) return "text-green-600";
    if (isDenied) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
          <MapPin className="w-5 h-5 text-blue-600" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">
            Ubicación y Cines Cercanos
          </h3>
          <p className={`text-sm font-medium mt-1 ${getStatusColor()}`}>
            {getStatusText()}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {isAllowed ? (
              <>
                Detectamos tu ubicación para mostrarte los cines cercanos que proyectan las películas que te interesan.
              </>
            ) : isDenied ? (
              <>
                Desactivaste la ubicación. Si cambias de opinión, puedes reactivarla aquí para ver cines cercanos.
              </>
            ) : (
              <>
                Activa la ubicación para que te mostremos los cines cercanos con sesiones disponibles y compra de entradas.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={resetLocationChoice}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          {isAllowed || isDenied ? "Cambiar preferencia" : "Activar ubicación"}
        </button>

        <a
          href="#privacy"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
        >
          Política de Privacidad
        </a>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-800">
          <strong>RGPD:</strong> Tu ubicación no se almacena en nuestros servidores. Solo se usa localmente en tu navegador para encontrar cines cercanos. 
          Puedes cambiar esta preferencia en cualquier momento.
        </p>
      </div>
    </div>
  );
}
