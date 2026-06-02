import { getWatchTodayMovie } from "@/lib/tmdb";
import {
  protectedJson,
  rejectCrossSiteRequest,
  rejectIfRateLimited,
} from "@/lib/apiProtection";

const MAX_ITEMS = 20;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function normalizeMovieList(value) {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, MAX_ITEMS)
    .map((movie) => ({
      id: Number(movie?.id),
      title: String(movie?.title ?? "").slice(0, 160),
      overview: String(movie?.overview ?? "").slice(0, 500),
      vote_average: Number(movie?.vote_average ?? 0),
      poster_path: movie?.poster_path ?? null,
      backdrop_path: movie?.backdrop_path ?? null,
      release_date: String(movie?.release_date ?? "").slice(0, 10),
      genre_ids: Array.isArray(movie?.genre_ids)
        ? movie.genre_ids.map(Number).filter(Number.isFinite).slice(0, 8)
        : [],
    }))
    .filter((movie) => Number.isFinite(movie.id));
}

function normalizeContext(value) {
  const hour = Number(value?.hour);
  const day = Number(value?.day);
  const variant = Number(value?.variant);

  return {
    hour: Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : new Date().getHours(),
    day: Number.isInteger(day) && day >= 0 && day <= 6 ? day : new Date().getDay(),
    date: String(value?.date ?? new Date().toISOString().slice(0, 10)).slice(0, 10),
    variant: Number.isInteger(variant) && variant >= 0 && variant <= 50 ? variant : 0,
  };
}

function localAnswer(movie, profile) {
  if (!movie) {
    return "No encontré una recomendación clara ahora mismo. Marca algunas películas como favoritas o vistas para afinar mejor.";
  }

  const signalCount = profile.favorites.length + profile.watchlist.length + profile.viewedHistory.length;
  const basis =
    signalCount > 0
      ? "Analicé tus favoritos, tu historial y tus películas en seguimiento."
      : "Todavía no tengo mucho historial tuyo, así que usé el momento del día y tendencias generales.";

  return `${basis} Para hoy te recomiendo "${movie.title}". ${movie.reason}`;
}

function localConversation(userMessage) {
  const text = userMessage.trim();
  if (!text) return "Estoy aquí. Puedes hablarme normal o pedirme una película para ver hoy.";

  return "Te entiendo. Puedo conversar contigo sobre películas, gustos, géneros o ayudarte a elegir qué ver hoy.";
}

function wantsRecommendation(userMessage) {
  const text = String(userMessage || "").toLowerCase();
  return (
    text.includes("recom") ||
    text.includes("ver hoy") ||
    text.includes("que ver") ||
    text.includes("qué ver") ||
    text.includes("pelicula") ||
    text.includes("película") ||
    text.includes("dame otra") ||
    text.includes("otra opción") ||
    text.includes("otra opcion")
  );
}

function movieTitles(list) {
  return list.map((movie) => movie.title).filter(Boolean).slice(0, 8);
}

function buildGeminiPrompt({ userMessage, movie, profile, context, shouldRecommend }) {
  const base = [
    "Eres CineBot, un asistente conversacional de películas.",
    "Responde en español, tono natural, cercano y breve.",
    "Puedes conversar normalmente sobre cine, gustos, géneros, actores, planes para ver películas o recomendaciones.",
    "No menciones datos técnicos, IDs, APIs ni TMDB.",
    "Máximo 100 palabras.",
    "",
    `Mensaje del usuario: ${userMessage || "Hola"}`,
    `Hora local: ${context.hour}:00`,
    `Día de semana: ${context.day}`,
    `Favoritos del usuario: ${movieTitles(profile.favorites).join(", ") || "ninguno"}`,
    `Historial visto: ${movieTitles(profile.viewedHistory).join(", ") || "ninguno"}`,
    `Seguimiento: ${movieTitles(profile.watchlist).join(", ") || "ninguno"}`,
  ];

  if (!shouldRecommend) {
    return [
      ...base,
      "",
      "El usuario NO está pidiendo una recomendación directa. Responde como una conversación normal.",
      "Si encaja, puedes invitarlo suavemente a pedir 'qué ver hoy', pero no recomiendes una película concreta.",
    ].join("\n");
  }

  return [
    ...base,
    "",
    "El usuario está pidiendo recomendación. Recomienda exactamente la película indicada; no inventes otra.",
    `Película elegida: ${movie?.title || "sin recomendación"}`,
    `Motivo del recomendador local: ${movie?.reason || "sin motivo"}`,
    `Resumen: ${movie?.overview || "sin resumen"}`,
    "Explica por qué encaja con el usuario usando favoritos, historial, seguimiento y hora actual.",
  ].join("\n");
}

async function generateGeminiText(prompt) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 180,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("Gemini no respondio OK:", response.status, errorText.slice(0, 240));
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim() || null;

    if (!text) {
      console.warn("Gemini respondio sin texto:", JSON.stringify(data).slice(0, 240));
    }

    return text;
  } catch (error) {
    console.warn("Gemini fallo:", error?.name || "error", error?.message || "");
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request) {
  const blocked = rejectCrossSiteRequest(request) || rejectIfRateLimited(request, 25);
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const profile = {
      favorites: normalizeMovieList(body?.favorites),
      watchlist: normalizeMovieList(body?.watchlist),
      viewedHistory: normalizeMovieList(body?.viewedHistory),
    };
    const context = normalizeContext(body?.context);
    const userMessage = String(body?.message ?? "").slice(0, 500);
    const shouldRecommend = wantsRecommendation(userMessage);
    const movie = shouldRecommend ? await getWatchTodayMovie(profile, context) : null;
    const fallback = shouldRecommend ? localAnswer(movie, profile) : localConversation(userMessage);
    const prompt = buildGeminiPrompt({
      userMessage,
      movie,
      profile,
      context,
      shouldRecommend,
    });
    const geminiText = await generateGeminiText(prompt);

    return protectedJson({
      movie,
      text: geminiText || fallback,
      provider: geminiText ? "gemini" : "local",
    });
  } catch (error) {
    console.error("Error en /api/assistant:", error);
    return protectedJson(
      {
        movie: null,
        text: "No pude calcular una recomendación ahora mismo. Inténtalo de nuevo.",
        provider: "local",
      },
      { status: 500 }
    );
  }
}
