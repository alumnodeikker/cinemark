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
      <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/75">
          <Loader className="h-4 w-4 animate-spin text-blue-300" />
          Buscando disponibilidad en streaming...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[1.35rem] border border-amber-300/25 bg-amber-400/10 p-5 text-amber-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-300" />
          <p className="text-sm text-amber-50/90">{error}</p>
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return null; // No mostrar si no hay proveedores
  }

  return (
    <section className="rounded-[1.35rem] border border-white/10 bg-[linear-gradient(135deg,rgba(9,13,24,0.92),rgba(18,24,38,0.72))] p-5 text-white shadow-[0_22px_70px_rgba(0,0,0,0.28)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-300/25 bg-blue-400/10">
              <Play className="h-4 w-4 fill-blue-200 text-blue-200" />
            </span>
            <h2 className="text-xl font-black tracking-tight">Disponible en streaming</h2>
          </div>
          <p className="mt-1 text-sm text-white/55">
            {location.countryName || location.countryCode} · enlaces directos a plataformas
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {providers.map((provider) => (
          <StreamingProviderCard
            key={provider.provider_id}
            provider={provider}
          />
        ))}
      </div>

    </section>
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
      <div className="inline-flex min-h-12 items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 opacity-70">
        <ProviderLogo provider={provider} />
        <div className="min-w-0">
          <h4 className="max-w-[150px] truncate text-sm font-bold text-white">
            {provider.provider_name}
          </h4>
          <p className="text-[11px] font-semibold text-white/45">Sin enlace directo</p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={providerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex min-h-12 items-center gap-3 rounded-full border border-white/12 bg-white/[0.06] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:-translate-y-0.5 hover:border-blue-300/35 hover:bg-white/[0.1]"
    >
      <ProviderLogo provider={provider} />
      <div className="min-w-0 pr-1">
        <h4 className="max-w-[170px] truncate text-sm font-bold text-white">
          {provider.provider_name}
        </h4>
        <p className="text-[11px] font-semibold text-blue-200/80">
          {accessTypeLabel[provider.access_type] || provider.access_type}
        </p>
      </div>
    </a>
  );
}

function ProviderLogo({ provider }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-white/20">
      {provider.logo_path ? (
        <img
          src={provider.logo_path}
          alt={provider.provider_name}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        <span className="text-sm font-black text-gray-500">
          {provider.provider_name?.slice(0, 1)}
        </span>
      )}
    </div>
  );
}
