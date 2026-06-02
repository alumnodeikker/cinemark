"use client";

import Image from "next/image";
import Link from "next/link";
import { Bot, Check, RotateCcw, Send, Sparkles, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMovieStore } from "@/stores/movieStore";

function compactMovie(movie) {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    vote_average: movie.vote_average,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date,
    genre_ids: movie.genre_ids ?? [],
  };
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function contextForVariant(variant) {
  const now = new Date();
  return {
    hour: now.getHours(),
    day: now.getDay(),
    date: localDateKey(now),
    variant,
  };
}

export default function MovieAssistantChat({ compact = false } = {}) {
  const favorites = useMovieStore((state) => state.favorites);
  const watchlist = useMovieStore((state) => state.watchlist);
  const viewedHistory = useMovieStore((state) => state.viewedHistory);
  const markViewed = useMovieStore((state) => state.markViewed);
  const [messages, setMessages] = useState([
    {
      id: "hello",
      role: "assistant",
      text: "Dime si quieres una película para ver hoy y elegiré una sola opción usando tus favoritos, historial y likes.",
    },
  ]);
  const [input, setInput] = useState("");
  const [variant, setVariant] = useState(0);
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const profile = useMemo(
    () => ({
      favorites: favorites.slice(0, 20).map(compactMovie),
      watchlist: watchlist.slice(0, 20).map(compactMovie),
      viewedHistory: viewedHistory.slice(0, 20).map(compactMovie),
    }),
    [favorites, watchlist, viewedHistory]
  );

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function recommendMovie(nextVariant = variant, userMessage = "Recomiéndame qué ver hoy.") {
    setLoading(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          message: userMessage,
          context: contextForVariant(nextVariant),
        }),
      });
      const data = response.ok ? await response.json() : { movie: null, text: null, provider: "local" };
      const movie = data?.movie ?? null;

      setMessages((current) => [
        ...current,
        {
          id: `bot-${Date.now()}`,
          role: "assistant",
          text: data?.text || "No pude calcular una recomendación ahora mismo. Inténtalo de nuevo.",
          movie,
          provider: data?.provider || "local",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `bot-${Date.now()}`,
          role: "assistant",
          text: "No pude calcular una recomendación ahora mismo. Inténtalo de nuevo.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function submitMessage(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text,
      },
    ]);

    recommendMovie(variant, text);
  }

  function handleQuickRecommend() {
    if (loading) return;
    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: "Recomiéndame qué ver hoy.",
      },
    ]);
    recommendMovie(variant, "Recomiéndame qué ver hoy.");
  }

  function handleAnother() {
    if (loading) return;
    const nextVariant = (variant + 1) % 51;
    setVariant(nextVariant);
    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: "Dame otra opción.",
      },
    ]);
    recommendMovie(nextVariant, "Dame otra opción.");
  }

  const rootClass = compact
    ? "flex h-full min-h-0 flex-col overflow-hidden bg-zinc-950"
    : "grid min-h-[72vh] overflow-hidden rounded-sm border border-white/10 bg-zinc-950 lg:grid-cols-[300px_minmax(0,1fr)]";

  const asideClass = compact
    ? "border-b border-white/10 bg-black/35 p-4"
    : "border-b border-white/10 bg-black/35 p-5 lg:border-b-0 lg:border-r";

  const bodyClass = compact ? "flex min-h-0 flex-1 flex-col" : "flex min-h-[72vh] flex-col";

  return (
    <section className={rootClass}>
      <aside className={asideClass}>
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-blue-600 text-white">
          <Bot className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-2xl font-black uppercase text-white">
          CineBot
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/62">
          Analiza tus favoritos, historial y seguimiento para elegir una película concreta.
        </p>

        <div className="mt-5 grid gap-2 text-sm text-white/72">
          <div className="rounded-sm border border-white/10 bg-white/6 px-3 py-2">
            Favoritos: <strong className="text-white">{favorites.length}</strong>
          </div>
          <div className="rounded-sm border border-white/10 bg-white/6 px-3 py-2">
            Vistas: <strong className="text-white">{viewedHistory.length}</strong>
          </div>
          <div className="rounded-sm border border-white/10 bg-white/6 px-3 py-2">
            Seguimiento: <strong className="text-white">{watchlist.length}</strong>
          </div>
        </div>

        <button
          type="button"
          onClick={handleQuickRecommend}
          disabled={loading}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" />
          Qué ver hoy
        </button>
      </aside>

      <div className={bodyClass}>
        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onAnother={handleAnother}
              onViewed={(movie) => markViewed(movie)}
              loading={loading}
            />
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-sm text-white/58">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-blue-600/25 text-blue-200">
                <Bot className="h-4 w-4" />
              </span>
              Analizando tus gustos...
            </div>
          )}
        </div>

        <form onSubmit={submitMessage} className="border-t border-white/10 p-3 sm:p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escribe: qué ver hoy..."
              className="h-12 min-w-0 rounded-sm border border-white/12 bg-black/45 px-4 text-sm text-white outline-none transition placeholder:text-white/38 focus:border-blue-300"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex h-12 items-center justify-center rounded-sm bg-blue-700 px-4 text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-55"
              aria-label="Enviar mensaje"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function MessageBubble({ message, onAnother, onViewed, loading }) {
  const isUser = message.role === "user";
  const movie = message.movie;

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-blue-600/25 text-blue-200">
          <Bot className="h-5 w-5" />
        </span>
      )}

      <div className={`max-w-3xl ${isUser ? "order-first" : ""}`}>
        <div
          className={`rounded-sm px-4 py-3 text-sm leading-6 ${
            isUser
              ? "bg-blue-700 text-white"
              : "border border-white/10 bg-white/7 text-white/82"
          }`}
        >
          {!isUser && message.provider && (
            <span className="mb-2 inline-flex rounded-sm border border-blue-300/25 bg-blue-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-blue-200">
              {message.provider === "gemini" ? "Gemini" : "Local"}
            </span>
          )}
          {message.text}
        </div>

        {movie && (
          <article className="mt-3 overflow-hidden rounded-sm border border-white/10 bg-black/45">
            <div className="grid gap-4 p-3 sm:grid-cols-[120px_minmax(0,1fr)]">
              <Link
                href={`/peli/${movie.id}`}
                className="relative block aspect-[2/3] overflow-hidden rounded-sm bg-zinc-900"
              >
                {movie.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                    alt={movie.title}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-white/52">
                    Sin poster
                  </div>
                )}
              </Link>

              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
                  Recomendación directa
                </p>
                <h3 className="mt-1 text-xl font-black text-white">{movie.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/68">
                  {movie.overview || "Abre la ficha para ver más detalles."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/peli/${movie.id}`}
                    className="rounded-sm bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-black transition hover:bg-white/90"
                  >
                    Ver ficha
                  </Link>
                  <button
                    type="button"
                    onClick={() => onViewed(movie)}
                    className="inline-flex items-center gap-2 rounded-sm border border-emerald-300/30 bg-emerald-400/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-400/18"
                  >
                    <Check className="h-4 w-4" />
                    Marcar vista
                  </button>
                  <button
                    type="button"
                    onClick={onAnother}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-sm border border-white/18 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white/78 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Otra opción
                  </button>
                </div>
              </div>
            </div>
          </article>
        )}
      </div>

      {isUser && (
        <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-white/10 text-white">
          <User className="h-5 w-5" />
        </span>
      )}
    </div>
  );
}
