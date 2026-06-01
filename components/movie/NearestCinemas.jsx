"use client";

import { generarUrlYelmo } from "@/lib/yelmoUrlGenerator";
import { useEffect, useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { getNearbyCinemas } from "@/lib/cinemasService";
import {
  MapPin,
  Ticket,
  Clock,
  Film,
  Loader,
  AlertCircle,
  Navigation,
} from "lucide-react";
export function NearestCinemas({ movieId, movieTitle }) {
  const { location } = useGeolocation();
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  // Cargar cines cercanos cuando tenemos ubicación y usuario lo permite
  useEffect(() => {
    const loadCinemas = async () => {
      // Solo cargar si:
      // 1. Tenemos coordenadas exactas (usuario aceptó)
      // 2. Tenemos país
      if (!location?.latitude || !location?.countryCode) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getNearbyCinemas(
          location.latitude,
          location.longitude,
          location.countryCode,
          15 // 15 km radio
        );

        if (result.success) {
          setCinemas(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("Error cargando cines cercanos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCinemas();
  }, [location?.latitude, location?.longitude, location?.countryCode]);

  if (!location?.latitude) {
    return null; // No mostrar si no tiene ubicación
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center gap-2 text-purple-900 font-semibold mb-4">
          <Loader className="w-5 h-5 animate-spin" />
          Buscando cines cercanos...
        </div>
      </div>
    );
  }

  if (error || cinemas.length === 0) {
    return (
      <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900">No hay cines cercanos</h3>
            <p className="text-sm text-amber-800 mt-1">
              No encontramos cines en un radio de 15 km. Intenta cambiar tu ubicación.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
        <Navigation className="w-6 h-6 text-purple-600" />
        Cines cercanos ({cinemas.length})
      </div>

      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {cinemas.slice(0, expanded ? undefined : 3).map((cinema) => (
          <CinemaCard
            key={cinema.id}
            cinema={cinema}
            movieId={movieId}
          />
        ))}
      </div>

      {cinemas.length > 3 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full py-2 text-center text-purple-600 hover:text-purple-700 font-medium text-sm border border-purple-200 rounded-lg hover:bg-purple-50 transition"
        >
          Ver {cinemas.length - 3} cines más
        </button>
      )}

      {expanded && cinemas.length > 3 && (
        <button
          onClick={() => setExpanded(false)}
          className="w-full py-2 text-center text-gray-600 hover:text-gray-700 font-medium text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          Ver menos
        </button>
      )}
    </div>
  );
}

/**
 * Tarjeta individual de cine
 */
function CinemaCard({ cinema, movieId }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{cinema.name}</h4>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" />
            {cinema.distance} km
          </p>
          <p className="text-xs text-gray-500 mt-1">{cinema.address}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
        {/* Formatos disponibles */}
        <div className="flex items-start gap-2">
          <Film className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex gap-1 flex-wrap">
            {cinema.formats.map((format) => (
              <span
                key={format}
                className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium"
              >
                {format}
              </span>
            ))}
          </div>
        </div>

        {/* Horarios */}
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex gap-1 flex-wrap">
            {cinema.showtimes.map((time) => (
              <span
                key={time}
                className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded font-medium"
              >
                {time}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Botón de compra */}
      <a
        href={generarUrlYelmo(movieTitle, cinema.city)}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition"
      >
        <Ticket className="w-4 h-4" />
        Comprar entradas
      </a>
      <p className="text-xs text-gray-500 text-center mt-2">
        Abrirá el sitio oficial del cine
      </p>
    </div>
  );
}
