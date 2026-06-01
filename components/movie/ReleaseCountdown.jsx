"use client";

import { useState, useEffect } from "react";
import { Calendar, Bell } from "lucide-react";

/**
 * Componente de cuenta atrás para próximos estrenos
 */
export function ReleaseCountdown({ releaseDate, movieTitle }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [reminded, setReminded] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date(releaseDate).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [releaseDate]);

  const handleSetReminder = () => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        // Ya tiene permiso
        setReminded(true);
        localStorage.setItem(
          `reminder_${movieTitle}`,
          JSON.stringify({ reminded: true, date: new Date() })
        );
      } else if (Notification.permission !== "denied") {
        // Solicitar permiso
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            setReminded(true);
            localStorage.setItem(
              `reminder_${movieTitle}`,
              JSON.stringify({ reminded: true, date: new Date() })
            );
          }
        });
      }
    }
  };

  if (!timeLeft) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-6 border-2 border-blue-300">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">Cuenta atrás</h3>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-900">
            {String(timeLeft.days).padStart(2, "0")}
          </div>
          <div className="text-xs font-semibold text-blue-700 mt-1">Días</div>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-cyan-900">
            {String(timeLeft.hours).padStart(2, "0")}
          </div>
          <div className="text-xs font-semibold text-cyan-700 mt-1">Horas</div>
        </div>
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-teal-900">
            {String(timeLeft.minutes).padStart(2, "0")}
          </div>
          <div className="text-xs font-semibold text-teal-700 mt-1">Min</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-900">
            {String(timeLeft.seconds).padStart(2, "0")}
          </div>
          <div className="text-xs font-semibold text-green-700 mt-1">Seg</div>
        </div>
      </div>

      <button
        onClick={handleSetReminder}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
          reminded
            ? "bg-green-100 text-green-700 border border-green-300"
            : "bg-blue-600 text-white hover:bg-blue-700 border border-blue-700"
        }`}
      >
        <Bell className="w-5 h-5" />
        {reminded ? "Recordatorio establecido ✓" : "Recordarme cuando se estrene"}
      </button>

      <p className="text-xs text-gray-500 text-center mt-3">
        Fecha de estreno: <strong>{new Date(releaseDate).toLocaleDateString("es-ES")}</strong>
      </p>
    </div>
  );
}
