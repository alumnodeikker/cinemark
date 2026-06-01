"use client";

import { generarUrlYelmo } from "@/lib/yelmoUrlGenerator";
import { ExternalLink, Ticket } from "lucide-react";

/**
 * Componente para compra de entradas en Yelmo
 * Genera automáticamente la URL correcta según película y ubicación
 */
export function YelmoTicketButton({ movieTitle, location, className = "" }) {
  if (!movieTitle) return null;

  // Generar URL inteligente
  const yelmoCinemasUrl = generarUrlYelmo(movieTitle, location?.countryName || location);

  return (
    <a
      href={yelmoCinemasUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium text-sm transition ${className}`}
      title="Comprar entradas en Cine Yelmo"
    >
      <Ticket className="w-4 h-4" />
      Entradas Yelmo
      <ExternalLink className="w-3.5 h-3.5 opacity-75" />
    </a>
  );
}

/**
 * Card de información de Yelmo para una película
 */
export function YelmoMovieCard({ movieTitle, location, className = "" }) {
  if (!movieTitle) return null;

  const yelmoCinemasUrl = generarUrlYelmo(movieTitle, location?.countryName || location);

  return (
    <div className={`border border-orange-200 rounded-lg p-4 bg-orange-50 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <img
            src="https://www.yelmocines.es/favicon.ico"
            alt="Yelmo"
            className="w-6 h-6"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900">Compra en Cine Yelmo</h4>
          <p className="text-sm text-gray-600 mt-1">
            {location?.countryName || "Tu"}
            {" "}cine más cercano con las mejores opciones de compra
          </p>
          <a
            href={yelmoCinemasUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium transition"
          >
            Ver horarios y comprar
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Badge con enlace a Yelmo (versión compacta)
 */
export function YelmoBadge({ movieTitle, location }) {
  if (!movieTitle) return null;

  const yelmoCinemasUrl = generarUrlYelmo(movieTitle, location?.countryName || location);

  return (
    <a
      href={yelmoCinemasUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-200 transition"
      title={`Ver en Yelmo: ${movieTitle}`}
    >
      <Ticket className="w-3 h-3" />
      Yelmo
    </a>
  );
}
