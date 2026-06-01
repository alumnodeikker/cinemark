"use client";

import { useEffect, useState } from "react";
import {
  getLocationPreference,
  setLocationPreference,
  shouldShowLocationBanner,
  resetLocationPreference,
  getCachedGeolocation,
  cacheGeolocation,
  getUserCoordinates,
  getCountryFromCoordinates,
  getCountryFromIP,
} from "@/lib/geolocation";

/**
 * Hook para obtener y gestionar la geolocalización del usuario
 * Respeta RGPD y NO solicita permisos repetidamente
 */
export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shouldShowBanner, setShouldShowBanner] = useState(false);
  const [preference, setPreference] = useState("not_configured");

  // Inicializar: comprobar preferencia y datos cacheados
  useEffect(() => {
    const initGeolocation = async () => {
      setLoading(true);

      try {
        // 1. Obtener preferencia guardada
        const userPreference = getLocationPreference();
        setPreference(userPreference);

        // 2. Comprobar si debemos mostrar banner (solo si es not_configured)
        setShouldShowBanner(shouldShowLocationBanner());

        // 3. Comprobar si hay datos en caché
        const cached = getCachedGeolocation();
        if (cached) {
          setLocation(cached);
          setLoading(false);
          return;
        }

        // 4. Si usuario ya rechazó, obtener solo país desde IP
        if (userPreference === "denied") {
          const ipCountry = await getCountryFromIP();
          setLocation(ipCountry);
          setLoading(false);
          return;
        }

        // 5. Si usuario ya aceptó, obtener ubicación exacta
        if (userPreference === "accepted") {
          await requestGeolocation();
          setLoading(false);
          return;
        }

        // 6. Si no está configurado, obtener al menos país desde IP como fallback
        const ipCountry = await getCountryFromIP();
        setLocation(ipCountry);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    initGeolocation();
  }, []);

  /**
   * Solicitar permiso de geolocalización
   * Solo se llamará si el usuario presiona "Activar"
   */
  const requestGeolocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const coordinates = await getUserCoordinates();

      if (!coordinates) {
        // Usuario rechazó en el navegador o no soportado
        setLocationPreference("denied");
        setPreference("denied");
        setShouldShowBanner(false);
        
        // Fallback a IP
        const ipCountry = await getCountryFromIP();
        setLocation(ipCountry);
        setLoading(false);
        return;
      }

      // Obtener país desde coordenadas
      const countryData = await getCountryFromCoordinates(
        coordinates.latitude,
        coordinates.longitude
      );

      const geoData = {
        ...coordinates,
        ...countryData,
      };

      cacheGeolocation(geoData);
      setLocation(geoData);
      setLocationPreference("accepted");
      setPreference("accepted");
      setShouldShowBanner(false);
    } catch (err) {
      setError(err.message);
      // Fallback a IP
      const ipCountry = await getCountryFromIP();
      setLocation(ipCountry);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Rechazar geolocalización (usuario presiona "No gracias")
   * NO volver a solicitar hasta que resetee manualmente
   */
  const rejectGeolocation = async () => {
    setLocationPreference("denied");
    setPreference("denied");
    setShouldShowBanner(false);
    
    // Obtener solo país desde IP
    const ipCountry = await getCountryFromIP();
    setLocation(ipCountry);
  };

  /**
   * Permitir al usuario cambiar su decisión desde ajustes
   */
  const resetLocationChoice = () => {
    resetLocationPreference();
    setPreference("not_configured");
    setShouldShowBanner(true);
    setLocation(null);
  };

  return {
    location,
    loading,
    error,
    shouldShowBanner,
    preference,
    requestGeolocation,
    rejectGeolocation,
    resetLocationChoice,
    isAllowed: preference === "accepted",
    isDenied: preference === "denied",
  };
}
