"use client";

import { useMemo, useState } from "react";
import { useMovieStore } from "@/stores/movieStore";

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "Ahora";
  }
}

function CommentForm({ onSubmit, placeholder = "Escribe un comentario..." }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const ok = onSubmit(body);
    if (!ok) {
      setError("Comentario demasiado corto o detectado como spam.");
      return;
    }
    setBody("");
    setError("");
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-sm border border-white/15 bg-black/45 px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-blue-300"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-amber-200/85">{error}</p>
        <button
          type="submit"
          className="rounded-sm bg-blue-700 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-blue-600"
        >
          Publicar
        </button>
      </div>
    </form>
  );
}

function CommentItem({ comment, replies, currentUserId, onReply, onEdit, onDelete, onLike }) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const mine = comment.authorId === currentUserId;

  return (
    <article className="rounded-sm border border-white/10 bg-black/24 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-white">{comment.authorName}</p>
          <p className="text-xs text-white/45">{formatDate(comment.createdAt)}</p>
        </div>
        <button
          type="button"
          onClick={() => onLike(comment.id)}
          className="rounded-sm border border-white/12 px-2 py-1 text-xs font-semibold text-white/75 transition hover:bg-white/10"
        >
          {comment.likes ?? 0} votos
        </button>
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            className="w-full resize-none rounded-sm border border-white/15 bg-black/45 px-3 py-2 text-sm text-white outline-none focus:border-blue-300"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (onEdit(comment.id, draft)) setEditing(false);
              }}
              className="rounded-sm bg-blue-700 px-3 py-1.5 text-xs font-bold text-white"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-sm border border-white/15 px-3 py-1.5 text-xs font-bold text-white/80"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-white/82">{comment.body}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
        <button type="button" onClick={() => setReplying((value) => !value)} className="text-blue-300">
          Responder
        </button>
        {mine && (
          <>
            <button type="button" onClick={() => setEditing(true)} className="text-white/70">
              Editar
            </button>
            <button type="button" onClick={() => onDelete(comment.id)} className="text-red-300">
              Eliminar
            </button>
          </>
        )}
      </div>

      {replying && (
        <div className="mt-4 border-l border-blue-300/25 pl-3">
          <CommentForm
            placeholder="Responder comentario..."
            onSubmit={(body) => {
              const ok = onReply(comment.id, body);
              if (ok) setReplying(false);
              return ok;
            }}
          />
        </div>
      )}

      {replies.length > 0 && (
        <div className="mt-4 space-y-3 border-l border-white/10 pl-3">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replies={[]}
              currentUserId={currentUserId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onLike={onLike}
            />
          ))}
        </div>
      )}
    </article>
  );
}

export default function MovieComments({ movieId, movieTitle }) {
  const user = useMovieStore((state) => state.user);
  const comments = useMovieStore((state) => state.comments);
  const addComment = useMovieStore((state) => state.addComment);
  const editComment = useMovieStore((state) => state.editComment);
  const deleteComment = useMovieStore((state) => state.deleteComment);
  const likeComment = useMovieStore((state) => state.likeComment);
  const loginUser = useMovieStore((state) => state.loginUser);
  const [sort, setSort] = useState("recent");

  const movieComments = useMemo(() => {
    const scoped = comments.filter((comment) => String(comment.movieId) === String(movieId));
    const parents = scoped.filter((comment) => !comment.parentId);
    const replies = scoped.filter((comment) => comment.parentId);
    const sorted = [...parents].sort((a, b) => {
      if (sort === "popular") return (b.likes ?? 0) - (a.likes ?? 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return sorted.map((comment) => ({
      comment,
      replies: replies
        .filter((reply) => reply.parentId === comment.id)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    }));
  }, [comments, movieId, sort]);

  const ensureUser = () => {
    if (user) return true;
    loginUser({ email: "usuario@local.test" });
    return true;
  };

  return (
    <section id="comentarios" className="netflix-panel p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black">Comentarios</h2>
          <p className="mt-1 text-sm text-white/62">Debate local con respuestas, edicion y moderacion basica.</p>
        </div>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="h-10 rounded-sm border border-white/15 bg-black px-3 text-sm text-white"
        >
          <option value="recent">Mas recientes</option>
          <option value="popular">Mas populares</option>
        </select>
      </div>

      <div className="mt-5">
        <CommentForm
          onSubmit={(body) => {
            ensureUser();
            return addComment({ movieId, movieTitle, body });
          }}
        />
      </div>

      <div className="mt-5 space-y-3">
        {movieComments.length ? (
          movieComments.map(({ comment, replies }) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={replies}
              currentUserId={user?.id ?? "local-user"}
              onReply={(parentId, body) => {
                ensureUser();
                return addComment({ movieId, movieTitle, parentId, body });
              }}
              onEdit={editComment}
              onDelete={deleteComment}
              onLike={likeComment}
            />
          ))
        ) : (
          <div className="rounded-sm border border-white/10 bg-black/24 p-5 text-sm text-white/62">
            Todavia no hay comentarios. Se el primero en publicar.
          </div>
        )}
      </div>
    </section>
  );
}
