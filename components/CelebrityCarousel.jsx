"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import BotonFavoritoActor from "./BotonFavoritoActor";

export default function CelebrityCarousel({ celebridades = [] }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -340 : 340,
      behavior: "smooth",
    });
  };

  return (
    <section className="netflix-panel px-4 py-6 text-white">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <span className="h-5 w-1 bg-blue-600" />
        Celebridades mas populares
      </h2>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-zinc-900/80 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white"
          type="button"
        >
          Anterior
        </button>

        <div ref={scrollRef} className="poster-rail px-14">
          {celebridades.map((celeb, i) => {
            const rank = i + 1;
            const profileUrl = celeb?.profile_path
              ? `https://image.tmdb.org/t/p/w185${celeb.profile_path}`
              : null;
            const knownFor = Array.isArray(celeb?.known_for)
              ? celeb.known_for
                  .map((item) => item?.title || item?.name)
                  .filter(Boolean)
                  .slice(0, 2)
                  .join(" • ")
              : "";

            return (
              <article
                key={celeb.id}
                className="min-w-[190px] rounded-2xl border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/actor/${celeb.id}`} className="group block">
                    <div className="relative h-20 w-20 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                      {profileUrl ? (
                        <Image
                          src={profileUrl}
                          alt={celeb.name}
                          fill
                          sizes="80px"
                          className="object-cover transition group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl text-blue-300">
                          {celeb.name?.charAt(0) ?? "?"}
                        </div>
                      )}
                    </div>
                  </Link>
                  <BotonFavoritoActor persona={celeb} />
                </div>

                <Link href={`/actor/${celeb.id}`} className="mt-2 block">
                  <p className="line-clamp-1 text-sm font-bold">#{rank} {celeb.name}</p>
                  <p className="text-xs text-white/65">Popularidad {Math.round(celeb.popularity ?? 0)}</p>
                  {knownFor ? <p className="mt-1 line-clamp-2 text-xs text-blue-200/85">{knownFor}</p> : null}
                </Link>
              </article>
            );
          })}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-zinc-900/80 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white"
          type="button"
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}

