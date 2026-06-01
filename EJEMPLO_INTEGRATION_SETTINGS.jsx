// Ejemplo de página de Ajustes de Usuario con LocationSettings

"use client";

import { LocationSettings } from "@/components/geolocation/LocationSettings";

export default function UserSettingsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white mb-8">Ajustes</h1>

      <div className="space-y-6">
        {/* Sección de Privacidad y Ubicación */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Privacidad y Ubicación</h2>
          <p className="text-white/70 text-sm">
            Gestiona cómo usamos tu ubicación para mostrarte información relevante.
          </p>
          
          <LocationSettings />
        </section>

        {/* Otras secciones de ajustes */}
        <section className="space-y-4 border-t border-white/10 pt-6">
          <h2 className="text-xl font-semibold text-white">Cuenta</h2>
          {/* Otros ajustes aquí */}
        </section>

        <section className="space-y-4 border-t border-white/10 pt-6">
          <h2 className="text-xl font-semibold text-white">Notificaciones</h2>
          {/* Otros ajustes aquí */}
        </section>
      </div>
    </main>
  );
}
