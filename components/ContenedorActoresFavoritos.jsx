"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocalStorageList } from "@/lib/useLocalStorageList";

const STORAGE_KEY = "favoritos_actores";

export default function ContenedorActoresFavoritos() {
  const actores = useLocalStorageList(STORAGE_KEY);
  const [topPeliculas, setTopPeliculas] = useState({});

  useEffect(() => {
    let activo = true;

    async function cargarTopPeliculas() {
      if (!actores.length) return;

      const entradas = await Promise.all(
        actores.map(async (actor) => {
          try {
            const res = await fetch(`/api/actor/${actor.id}/top-movies`, {
              cache: "no-store",
            });
            if (!res.ok) return [actor.id, []];
            const data = await res.json();
            return [actor.id, Array.isArray(data?.movies) ? data.movies : []];
          } catch {
            return [actor.id, []];
          }
        })
      );

      if (activo) {
        setTopPeliculas(Object.fromEntries(entradas));
      }
    }

    cargarTopPeliculas();

    return () => {
      activo = false;
    };
  }, [actores]);

  return (
    <section className="space-y-6">
      <div className="movie-grid">
        {actores.length === 0 ? (
          <div className="netflix-panel col-span-full p-8 text-center">
            <p className="text-lg font-semibold uppercase text-white">Tu lista de actores esta vacia</p>
            <p className="mt-2 text-sm text-white/70">
              Marca actores con el corazon para verlos aqui.
            </p>
          </div>
        ) : (
          actores.map((actor) => {
            const profile = actor.profile_path
              ? `https://image.tmdb.org/t/p/w342${actor.profile_path}`
              : null;

            return (
              <div
                key={actor.id}
                className="group rounded-lg border border-white/10 bg-zinc-900 p-2 transition hover:bg-zinc-800"
              >
                <Link href={`/actor/${actor.id}`}>
                  <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-zinc-800">
                    {profile ? (
                      <Image
                        src={profile}
                        alt={actor.name}
                        fill
                        sizes="180px"
                        className="object-cover transition group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </div>
                </Link>
                <Link href={`/actor/${actor.id}`} className="mt-2 block line-clamp-2 text-sm font-semibold">
                  {actor.name}
                </Link>
                <p className="text-xs text-white/65">
                  Popularidad {Math.round(actor.popularity ?? 0)}
                </p>

                <div className="mt-2 space-y-1">
                  {(topPeliculas[actor.id] ?? []).slice(0, 3).map((movie) => (
                    <Link
                      key={`${actor.id}-${movie.id}`}
                      href={`/peli/${movie.id}`}
                      className="block line-clamp-1 text-xs text-blue-200/90 hover:text-blue-100"
                    >
                      {movie.title}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
