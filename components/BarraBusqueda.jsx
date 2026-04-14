"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function BarraBusqueda() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Inicializar el input con lo que ya hay en la URL
  const [texto, setTexto] = useState(searchParams.get("q") ?? "");

  function buscar() {
    if (!texto.trim()) return;

    const params = new URLSearchParams(searchParams);
    params.set("q", texto.trim());
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="relative">
        <input
          type="text"
          placeholder="Busca titulos, directores o sagas..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
          className="h-12 w-full rounded-sm border border-white/25 bg-black/65 px-4 pr-28 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        />
        <div className="absolute inset-y-1.5 right-1.5 flex items-center gap-2">
          <button
            type="button"
            onClick={buscar}
            className="rounded-sm bg-blue-700 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-blue-600"
          >
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
}
