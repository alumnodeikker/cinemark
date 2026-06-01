"use client";

import { useEffect, useId, useState } from "react";

function embedUrl(key) {
  if (!key) return null;
  return `https://www.youtube-nocookie.com/embed/${key}?rel=0&modestbranding=1&autoplay=1`;
}

export default function TrailerModal({
  trailerKey,
  title = "Trailer",
  buttonLabel = "Ver trailer",
  buttonClassName = "",
  className = "",
  children,
}) {
  const [open, setOpen] = useState(false);
  const headingId = useId();
  const url = embedUrl(trailerKey);

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

  if (!trailerKey) {
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
        onClick={() => setOpen(true)}
        className={buttonClassName || className}
        aria-haspopup="dialog"
      >
        {children ?? buttonLabel}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/82 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-5xl overflow-hidden rounded-sm border border-white/12 bg-[#090909] shadow-2xl shadow-black/70">
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
            <div className="aspect-video bg-black">
              <iframe
                src={url}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
