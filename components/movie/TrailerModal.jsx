"use client";

import { useEffect, useId, useState } from "react";

function embedUrl(key) {
  if (!key) return null;
  return `https://www.youtube-nocookie.com/embed/${key}?rel=0&modestbranding=1&autoplay=1`;
}

export default function TrailerModal({
  trailerKey,
  movieId = null,
  title = "Trailer",
  buttonLabel = "Ver trailer",
  buttonClassName = "",
  className = "",
  children,
}) {
  const [open, setOpen] = useState(false);
  const [resolvedKey, setResolvedKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const headingId = useId();
  const activeKey = trailerKey || resolvedKey;
  const url = embedUrl(activeKey);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.documentElement.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleOpen() {
    setError(false);

    if (activeKey) {
      setOpen(true);
      return;
    }

    if (!movieId || loading) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/trailer/${movieId}`);
      const data = response.ok ? await response.json() : { key: null };

      if (data?.key) {
        setResolvedKey(data.key);
        setOpen(true);
      } else {
        setError(true);
        setOpen(true);
      }
    } catch {
      setError(true);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  if (!activeKey && !movieId) {
    return (
      <span className={`${buttonClassName || className} cursor-not-allowed opacity-55`}>
        {children ?? buttonLabel}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={buttonClassName || className}
        aria-haspopup="dialog"
        aria-busy={loading}
      >
        {loading ? "Cargando..." : children ?? buttonLabel}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/88 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="w-[min(96vw,1180px)] overflow-hidden rounded-sm border border-white/12 bg-[#090909] shadow-2xl shadow-black/70">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
              <h2 id={headingId} className="line-clamp-1 text-base font-black text-white sm:text-lg">
                {title}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar trailer"
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-white/15 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                x
              </button>
            </div>
            <div className="mx-auto aspect-video w-full bg-black">
              {url ? (
                <iframe
                  src={url}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center">
                  <div>
                    <p className="text-lg font-black text-white">Trailer no disponible</p>
                    <p className="mt-2 text-sm text-white/62">
                      No encontramos un trailer reproducible para esta pelicula.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
