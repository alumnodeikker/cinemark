"use client";

import { Bot, X } from "lucide-react";
import { useEffect, useState } from "react";
import MovieAssistantChat from "@/components/assistant/MovieAssistantChat";

export default function AssistantFloatingButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    if (open) {
      document.documentElement.style.overflow = "hidden";
      document.addEventListener("keydown", onKeyDown);
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir asistente de recomendaciones"
        title="Pedir recomendación"
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full border border-blue-300/35 bg-blue-700 text-white shadow-[0_16px_40px_rgba(0,0,0,0.5)] transition hover:-translate-y-0.5 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 sm:bottom-6 sm:right-6"
      >
        <Bot className="h-7 w-7" />
        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-black bg-amber-300" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] bg-black/10 backdrop-blur-[1px]">
          <div
            className="absolute inset-0"
            onMouseDown={() => setOpen(false)}
            aria-hidden="true"
          />

          <aside
            className="absolute right-0 top-0 h-full w-full overflow-hidden border-l border-white/10 bg-[#090909]/98 shadow-2xl shadow-black/70 sm:w-[420px]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">
                  CineBot
                </p>
                <h2 className="text-base font-black uppercase text-white">
                  Asistente
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-white/12 text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Cerrar asistente"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-[calc(100%-57px)]">
              <MovieAssistantChat compact />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
