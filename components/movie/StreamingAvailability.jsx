"use client";

import { useEffect, useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Play, Loader, AlertCircle } from "lucide-react";

/**
 * Componente que muestra disponibilidad de streaming
 */
export function StreamingAvailability({ movieId, movieTitle }) {
  const { location } = useGeolocation();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar disponibilidad cuando tenemos país
  useEffect(() => {
    const loadStreaming = async () => {
      if (!location?.countryCode) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          movieId: String(movieId),
          countryCode: location.countryCode,
        });
        if (movieTitle) {
          params.set("movieTitle", movieTitle);
        }
        const response = await fetch(`/api/streaming/availability?${params}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Error cargando disponibilidad");
        }

        if (result.success) {
          setProviders(result.data);
        } else if (result.data.length === 0) {
          setError(result.message);
        }
      } catch (err) {
        setError("Error cargando disponibilidad de streaming");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStreaming();
  }, [movieId, movieTitle, location?.countryCode]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200">
        <div className="flex items-center gap-2 text-indigo-900 font-semibold">
          <Loader className="w-5 h-5 animate-spin" />
          Buscando disponibilidad en streaming...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">{error}</p>
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return null; // No mostrar si no hay proveedores
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
        <Play className="w-6 h-6 text-indigo-600" />
        Disponible en streaming
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {providers.map((provider) => (
          <StreamingProviderCard
            key={provider.provider_id}
            provider={provider}
          />
        ))}
      </div>

      <p className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
        Datos de TMDB Watch Providers para {location.countryName || location.countryCode}. Los enlaces se abren en una pestaña nueva.
      </p>
    </div>
  );
}

/**
 * Tarjeta de proveedor de streaming
 */
function StreamingProviderCard({ provider }) {
  const accessTypeLabel = {
    subscription: "Suscripción",
    rent: "Alquiler",
    buy: "Compra",
  };

  const providerUrl =
    provider?.url && !provider.url.includes("themoviedb.org") ? provider.url : null;

  if (!providerUrl) {
    return (
      <div className="block bg-white border border-gray-200 rounded-lg p-4 opacity-70">
        <ProviderLogo provider={provider} />
        <h4 className="font-semibold text-sm text-gray-900 truncate">
          {provider.provider_name}
        </h4>
        <p className="text-xs text-gray-600 mt-1">
          Sin enlace directo público
        </p>
      </div>
    );
  }

  return (
    <a
      href={providerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition group"
    >
      <ProviderLogo provider={provider} />
      <h4 className="font-semibold text-sm text-gray-900 truncate">
        {provider.provider_name}
      </h4>
      <p className="text-xs text-gray-600 mt-1">
        {accessTypeLabel[provider.access_type] || provider.access_type}
      </p>
    </a>
  );
}

function ProviderLogo({ provider }) {
  return (
    <div className="aspect-square bg-gray-100 rounded-md overflow-hidden mb-2 flex items-center justify-center group-hover:bg-gray-200 transition">
      {provider.logo_path ? (
        <img
          src={provider.logo_path}
          alt={provider.provider_name}
          className="w-12 h-12 object-contain"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        <span className="text-lg font-black text-gray-400">
          {provider.provider_name?.slice(0, 1)}
        </span>
      )}
    </div>
  );
}
