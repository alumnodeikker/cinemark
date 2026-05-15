"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import FavoriteActorButton from "@/components/movie/FavoriteActorButton";

export default function CelebrityCarousel({ celebridades = [] }) {
  const scrollRef = useRef(null);
  const populares = [...celebridades]
    .filter((celeb) => celeb?.id)
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -340 : 340,
      behavior: "smooth",
    });
  };

  return (
    <section className="space-y-3 text-white">
      <h2 className="flex items-center gap-2 text-3xl font-black uppercase tracking-normal text-white">
        <span className="h-7 w-1 bg-blue-600" />
        Celebridades mas populares
      </h2>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-[4.1rem] z-10 hidden h-12 w-9 -translate-y-1/2 items-center justify-center rounded-r-sm border border-l-0 border-white/15 bg-black/75 text-white transition hover:bg-black sm:inline-flex"
          type="button"
          aria-label="Ver celebridades anteriores"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor">
            <path d="m15 5-7 7 7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div ref={scrollRef} className="poster-rail gap-7 px-1 py-1 sm:px-10">
          {populares.map((celeb) => {
            const profileUrl = celeb?.profile_path
              ? `https://image.tmdb.org/t/p/w342${celeb.profile_path}`
              : null;

            return (
              <article
                key={celeb.id}
                className="min-w-[132px] max-w-[132px] text-center sm:min-w-[150px] sm:max-w-[150px]"
              >
                <div className="relative mx-auto h-[132px] w-[132px] sm:h-[150px] sm:w-[150px]">
                  <Link href={`/actor/${celeb.id}`} className="group block h-full w-full" aria-label={`Ver perfil de ${celeb.name}`}>
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-zinc-900 ring-1 ring-white/10">
                      {profileUrl ? (
                        <Image
                          src={profileUrl}
                          alt={celeb.name}
                          fill
                          sizes="(max-width: 640px) 132px, 150px"
                          className="object-cover transition group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl font-black text-blue-300">
                          {celeb.name?.charAt(0) ?? "?"}
                        </div>
                      )}
                    </div>
                  </Link>
                  <FavoriteActorButton
                    persona={celeb}
                    className="absolute bottom-0 right-0 bg-black/75 text-white shadow-lg shadow-black/40 backdrop-blur transition hover:bg-black"
                  />
                </div>

                <Link href={`/actor/${celeb.id}`} className="mt-3 block">
                  <p className="truncate text-base font-bold leading-tight text-white">{celeb.name}</p>
                  <p className="mt-1 text-sm font-semibold text-blue-300">{Math.round(celeb.popularity ?? 0)}</p>
                </Link>
              </article>
            );
          })}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-[4.1rem] z-10 hidden h-12 w-9 -translate-y-1/2 items-center justify-center rounded-l-sm border border-r-0 border-white/15 bg-black/75 text-white transition hover:bg-black sm:inline-flex"
          type="button"
          aria-label="Ver mas celebridades"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor">
            <path d="m9 5 7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}
