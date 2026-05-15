"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function SearchIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
      <circle cx="11" cy="11" r="7" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
      <path d="M4 11.5 12 5l8 6.5V20h-5v-5h-6v5H4z" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
      <rect x="4" y="4" width="7" height="7" strokeWidth="2" />
      <rect x="13" y="4" width="7" height="7" strokeWidth="2" />
      <rect x="4" y="13" width="7" height="7" strokeWidth="2" />
      <rect x="13" y="13" width="7" height="7" strokeWidth="2" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
      <path
        d="m12 20-1.2-1C6.2 15 3 12.2 3 8.8 3 6.2 5.1 4 7.7 4c1.5 0 3 .8 3.8 2 .8-1.2 2.3-2 3.8-2C17.9 4 20 6.2 20 8.8c0 3.4-3.2 6.2-7.8 10.2z"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ITEMS = [
  { href: "/", label: "Inicio", icon: HomeIcon },
  { href: "/populares", label: "Populares", icon: GridIcon },
  { href: "/mis_actores", label: "Actores", icon: GridIcon },
  { href: "/mis_fav", label: "Favoritas", icon: HeartIcon },
];

function movieYear(date) {
  return date?.split("-")?.[0] ?? "N/D";
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchBoxRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cleanQuery = query.trim();
    if (cleanQuery.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(cleanQuery)}`, {
          signal: controller.signal,
        });
        const data = res.ok ? await res.json() : { results: [] };
        setResults(Array.isArray(data.results) ? data.results.slice(0, 6) : []);
        setOpen(true);
      } catch (error) {
        if (error.name !== "AbortError") {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!searchBoxRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const buscar = (event) => {
    event.preventDefault();
    const texto = query.trim();
    if (!texto) return;
    setOpen(false);
    router.push(`/buscar?q=${encodeURIComponent(texto)}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070707]/95 backdrop-blur">
      <div className="flex min-h-16 flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:gap-5 lg:px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            aria-label="Ir al inicio"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-600 text-xl font-black text-white shadow-lg shadow-blue-950/35 transition hover:bg-blue-500"
          >
            C
          </Link>

          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-sm font-bold text-white/75 [scrollbar-width:none] lg:overflow-visible [&::-webkit-scrollbar]:hidden">
            {ITEMS.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href)) ||
                (item.href === "/" && pathname.startsWith("/peli/"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-10 shrink-0 items-center gap-2 rounded-sm px-3 transition ${
                    active
                      ? "bg-blue-600/20 text-blue-200 ring-1 ring-blue-400/25"
                      : "hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <form ref={searchBoxRef} onSubmit={buscar} className="relative min-w-0 flex-1 lg:max-w-3xl">
          <div className="grid h-11 grid-cols-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-sm border border-blue-400/35 bg-black/55 text-white shadow-lg shadow-black/20 transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500/25">
            <span className="flex items-center border-r border-white/10 px-3 text-xs font-black uppercase tracking-[0.16em] text-blue-300">
              Todo
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => query.trim().length >= 2 && setOpen(true)}
              placeholder="Buscar peliculas..."
              className="min-w-0 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/42"
            />
            <button
              type="submit"
              aria-label="Buscar pelicula"
              className="flex w-12 items-center justify-center text-blue-200 transition hover:bg-blue-600/20 hover:text-white"
            >
              <SearchIcon />
            </button>
          </div>

          {open && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-sm border border-blue-400/25 bg-[#101010] shadow-2xl shadow-black/60">
              <div className="border-b border-white/8 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-300">
                {loading ? "Buscando..." : "Opciones de busqueda"}
              </div>
              <div className="max-h-[24rem] overflow-y-auto">
                {!loading && results.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-white/60">No hay resultados todavia.</p>
                ) : (
                  results.map((movie) => {
                    const poster = movie.poster_path
                      ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                      : null;

                    return (
                      <Link
                        key={movie.id}
                        href={`/peli/${movie.id}`}
                        onClick={() => setOpen(false)}
                        className="grid grid-cols-[44px_minmax(0,1fr)] gap-3 border-b border-white/6 px-3 py-2 transition last:border-b-0 hover:bg-blue-600/16"
                      >
                        <div className="relative h-16 overflow-hidden rounded-sm bg-zinc-900">
                          {poster ? (
                            <Image
                              src={poster}
                              alt={movie.title}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs font-black text-blue-300">
                              C
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 py-1">
                          <p className="truncate text-sm font-bold text-white">{movie.title}</p>
                          <p className="mt-1 text-xs font-semibold text-blue-200">
                            {movieYear(movie.release_date)}
                            {movie.vote_average ? ` · ${Number(movie.vote_average).toFixed(1)}/10` : ""}
                          </p>
                          <p className="mt-1 line-clamp-1 text-xs text-white/55">
                            {movie.overview || "Abrir ficha de pelicula"}
                          </p>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </header>
  );
}
