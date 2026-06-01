"use client";

import { useMemo } from "react";
import { CalendarDays, Globe2 } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";

const RELEASE_TYPES = {
  1: "Premiere",
  2: "Estreno limitado",
  3: "Estreno en cines",
  4: "Digital",
  5: "Físico",
  6: "TV",
};

const COUNTRY_CURRENCIES = {
  ES: "EUR",
  FR: "EUR",
  IT: "EUR",
  DE: "EUR",
  PT: "EUR",
  MX: "MXN",
  US: "USD",
  GB: "GBP",
};

const COUNTRY_LOCALES = {
  ES: "es-ES",
  FR: "fr-FR",
  IT: "it-IT",
  DE: "de-DE",
  PT: "pt-PT",
  MX: "es-MX",
  US: "en-US",
  GB: "en-GB",
};

function pickReleaseDate(releaseDates = [], countryCode = "ES") {
  const country = String(countryCode || "ES").toUpperCase();
  const entry =
    releaseDates.find((item) => item?.iso_3166_1 === country) ||
    releaseDates.find((item) => item?.iso_3166_1 === "ES") ||
    releaseDates[0];

  const dates = Array.isArray(entry?.release_dates) ? entry.release_dates : [];
  const theatrical = dates.find((date) => date.type === 3 || date.type === 2);
  const selected = theatrical || dates[0];

  return selected
    ? {
        countryCode: entry.iso_3166_1,
        date: selected.release_date,
        type: RELEASE_TYPES[selected.type] || "Estreno",
        certification: selected.certification || null,
      }
    : null;
}

function formatDate(value, locale) {
  if (!value) return "No disponible";
  return new Intl.DateTimeFormat(locale || "es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function LocalReleaseInfo({ releaseDates = [] }) {
  const { location } = useGeolocation();

  const countryCode = location?.countryCode || "ES";
  const locale = COUNTRY_LOCALES[countryCode] || "es-ES";
  const localRelease = useMemo(
    () => pickReleaseDate(releaseDates, countryCode),
    [releaseDates, countryCode]
  );
  const currency = COUNTRY_CURRENCIES[countryCode] || "EUR";

  if (!localRelease) return null;

  return (
    <section className="rounded-lg border border-sky-200 bg-sky-50 p-6 text-sky-950">
      <div className="flex items-center gap-2 text-lg font-bold">
        <Globe2 className="h-6 w-6 text-sky-700" />
        Adaptado a tu país
      </div>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="flex items-start gap-2">
          <CalendarDays className="mt-0.5 h-4 w-4 text-sky-700" />
          <div>
            <p className="font-semibold">Fecha de estreno local</p>
            <p>
              {formatDate(localRelease.date, locale)} ({localRelease.countryCode})
            </p>
          </div>
        </div>
        <div>
          <p className="font-semibold">Tipo de estreno</p>
          <p>{localRelease.type}</p>
        </div>
        <div>
          <p className="font-semibold">Idioma</p>
          <p>{locale}</p>
        </div>
        <div>
          <p className="font-semibold">Moneda</p>
          <p>{currency}</p>
        </div>
      </div>
    </section>
  );
}
