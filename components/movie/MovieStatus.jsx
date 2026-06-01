"use client";

import { useMemo } from "react";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  Zap,
} from "lucide-react";

/**
 * Estados posibles de una película
 * - theatrical: En cartelera
 * - upcoming: Próximo estreno
 * - ended: Finalizada en cines
 * - streaming: Disponible en streaming
 */
export function MovieStatus({ releaseDate, status }) {
  const movieStatus = useMemo(() => {
    const today = new Date();
    const release = new Date(releaseDate);

    if (status === "Upcoming" || release > today) {
      const daysUntil = Math.ceil((release - today) / (1000 * 60 * 60 * 24));
      return {
        type: "upcoming",
        label: "Próximo estreno",
        icon: Clock,
        color: "from-blue-50 to-cyan-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-900",
        badgeColor: "bg-blue-100 text-blue-700",
        icon_color: "text-blue-600",
        daysUntil,
      };
    }

    // En cartelera (asumir 120 días de exhibición)
    const endDate = new Date(release);
    endDate.setDate(endDate.getDate() + 120);

    if (today <= endDate) {
      const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      return {
        type: "theatrical",
        label: "En cartelera",
        icon: Zap,
        color: "from-purple-50 to-pink-50",
        borderColor: "border-purple-200",
        textColor: "text-purple-900",
        badgeColor: "bg-purple-100 text-purple-700",
        icon_color: "text-purple-600",
        daysLeft,
      };
    }

    // Finalizada
    return {
      type: "ended",
      label: "Finalizada en cines",
      icon: CheckCircle,
      color: "from-amber-50 to-orange-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-900",
      badgeColor: "bg-amber-100 text-amber-700",
      icon_color: "text-amber-600",
    };
  }, [releaseDate, status]);

  const Icon = movieStatus.icon;

  return (
    <div
      className={`bg-gradient-to-r ${movieStatus.color} rounded-lg p-6 border ${movieStatus.borderColor}`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-6 h-6 ${movieStatus.icon_color} flex-shrink-0`} />
        <div className="flex-1">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${movieStatus.badgeColor} mb-2`}>
            {movieStatus.label}
          </span>
          <p className={`text-sm ${movieStatus.textColor}`}>
            {movieStatus.type === "upcoming" && movieStatus.daysUntil > 0 && (
              <>
                Se estrena en <strong>{movieStatus.daysUntil} días</strong>
              </>
            )}
            {movieStatus.type === "theatrical" && (
              <>
                En cartelera durante <strong>{movieStatus.daysLeft} días más</strong>
              </>
            )}
            {movieStatus.type === "ended" && (
              <>
                Ahora disponible en plataformas de streaming
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
