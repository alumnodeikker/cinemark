"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export default function MoviePhotoGallery({
  images = [],
  title = "Pelicula",
  remaining = 0,
}) {
  const scrollRef = useRef(null);
  const validImages = images.filter((image) => image?.file_path);
  const [selectedPath, setSelectedPath] = useState(validImages[0]?.file_path ?? null);
  const selectedImage =
    validImages.find((image) => image.file_path === selectedPath) ?? validImages[0] ?? null;

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  if (!selectedImage) return null;

  const selectedUrl = `https://image.tmdb.org/t/p/original${selectedImage.file_path}`;

  return (
    <div className="mt-6 space-y-4">
      <div className="relative overflow-hidden rounded-sm border border-white/10 bg-black">
        <div className="relative aspect-video min-h-[220px] sm:min-h-[420px]">
          <Image
            src={selectedUrl}
            alt={`Foto principal de ${title}`}
            fill
            sizes="(max-width: 1280px) 100vw, 1180px"
            className="object-cover"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-4 sm:p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                Imagen principal
              </p>
              <h3 className="mt-1 text-xl font-black text-white sm:text-2xl">{title}</h3>
            </div>
            <p className="hidden text-sm font-semibold text-white/72 sm:block">
              {validImages.findIndex((image) => image.file_path === selectedImage.file_path) + 1} /{" "}
              {validImages.length + remaining}
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label="Ver fotos anteriores"
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 z-10 hidden h-14 w-10 -translate-y-1/2 items-center justify-center rounded-r-sm border border-l-0 border-white/20 bg-black/75 text-white transition hover:bg-black sm:inline-flex"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor">
            <path d="m15 5-7 7 7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div ref={scrollRef} className="poster-rail gap-3 pb-2 sm:px-10">
          {validImages.map((image, index) => {
            const imageUrl = `https://image.tmdb.org/t/p/w500${image.file_path}`;
            const isSelected = image.file_path === selectedImage.file_path;
            const showRemaining = index === validImages.length - 1 && remaining > 0;

            return (
              <button
                key={`${image.file_path}-${index}`}
                type="button"
                onClick={() => setSelectedPath(image.file_path)}
                aria-label={`Ver imagen ${index + 1} de ${title}`}
                className={`group relative aspect-video w-[220px] shrink-0 overflow-hidden rounded-sm bg-zinc-900 text-left ring-offset-2 ring-offset-black transition sm:w-[260px] ${
                  isSelected ? "ring-2 ring-amber-300" : "hover:ring-1 hover:ring-white/45"
                }`}
              >
                <Image
                  src={imageUrl}
                  alt={`Imagen ${index + 1} de ${title}`}
                  fill
                  sizes="260px"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                {showRemaining && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                    <span className="text-2xl font-black text-white">+{remaining}</span>
                  </div>
                )}
                <span className="absolute bottom-2 left-2 rounded-sm bg-black/65 px-2 py-1 text-xs font-black text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Ver mas fotos"
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 z-10 hidden h-14 w-10 -translate-y-1/2 items-center justify-center rounded-l-sm border border-r-0 border-white/20 bg-black/75 text-white transition hover:bg-black sm:inline-flex"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor">
            <path d="m9 5 7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
