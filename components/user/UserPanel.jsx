"use client";

import Link from "next/link";
import { useState } from "react";
import { useMovieStore } from "@/stores/movieStore";

export default function UserPanel() {
  const user = useMovieStore((state) => state.user);
  const authView = useMovieStore((state) => state.authView);
  const registerUser = useMovieStore((state) => state.registerUser);
  const loginUser = useMovieStore((state) => state.loginUser);
  const logoutUser = useMovieStore((state) => state.logoutUser);
  const setAuthView = useMovieStore((state) => state.setAuthView);
  const updateUser = useMovieStore((state) => state.updateUser);
  const favorites = useMovieStore((state) => state.favorites);
  const viewedHistory = useMovieStore((state) => state.viewedHistory);
  const comments = useMovieStore((state) => state.comments);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    avatar: user?.avatar ?? "",
    bio: user?.bio ?? "",
  });

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  if (!user) {
    return (
      <section className="netflix-panel mx-auto max-w-3xl p-5 sm:p-7">
        <div className="flex gap-2">
          {["login", "register", "recover"].map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setAuthView(view)}
              className={`rounded-sm px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${
                authView === view ? "bg-blue-700 text-white" : "border border-white/15 text-white/70"
              }`}
            >
              {view === "login" ? "Entrar" : view === "register" ? "Registro" : "Recuperar"}
            </button>
          ))}
        </div>

        <form
          className="mt-5 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (authView === "register") registerUser(form);
            else loginUser(form);
          }}
        >
          {authView === "register" && (
            <input
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Nombre"
              className="h-11 rounded-sm border border-white/15 bg-black/45 px-3 text-white outline-none focus:border-blue-300"
            />
          )}
          <input
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder="Email"
            className="h-11 rounded-sm border border-white/15 bg-black/45 px-3 text-white outline-none focus:border-blue-300"
          />
          {authView !== "recover" && (
            <input
              type="password"
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              placeholder="Contrasena"
              className="h-11 rounded-sm border border-white/15 bg-black/45 px-3 text-white outline-none focus:border-blue-300"
            />
          )}
          <button className="h-11 rounded-sm bg-blue-700 text-sm font-black uppercase tracking-[0.16em] text-white">
            {authView === "recover" ? "Enviar enlace local" : "Continuar"}
          </button>
          {authView === "recover" && (
            <p className="text-sm text-white/62">
              En esta version local se simula la recuperacion. Para produccion hay que conectar un proveedor de email.
            </p>
          )}
        </form>
      </section>
    );
  }

  const userComments = comments.filter((comment) => comment.authorId === user.id);

  return (
    <section className="space-y-5">
      <article className="netflix-panel grid gap-5 p-5 sm:p-7 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-blue-300/35 bg-blue-600/20 text-4xl font-black text-blue-200">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <h1 className="mt-3 text-2xl font-black">{user.name}</h1>
          <p className="text-sm text-white/55">{user.email}</p>
          <button
            type="button"
            onClick={logoutUser}
            className="mt-4 rounded-sm border border-white/15 px-3 py-2 text-xs font-bold text-white/80"
          >
            Cerrar sesion
          </button>
        </div>

        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            updateUser(form);
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Nombre" className="h-11 rounded-sm border border-white/15 bg-black/45 px-3 text-white outline-none focus:border-blue-300" />
            <input value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="Email" className="h-11 rounded-sm border border-white/15 bg-black/45 px-3 text-white outline-none focus:border-blue-300" />
          </div>
          <input value={form.avatar} onChange={(event) => update("avatar", event.target.value)} placeholder="URL de avatar" className="h-11 rounded-sm border border-white/15 bg-black/45 px-3 text-white outline-none focus:border-blue-300" />
          <textarea value={form.bio} onChange={(event) => update("bio", event.target.value)} placeholder="Bio" rows={3} className="resize-none rounded-sm border border-white/15 bg-black/45 px-3 py-2 text-white outline-none focus:border-blue-300" />
          <button className="w-fit rounded-sm bg-blue-700 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white">
            Guardar perfil
          </button>
        </form>
      </article>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Favoritos" items={favorites} empty="Sin favoritos." />
        <Panel title="Historial" items={viewedHistory} empty="Sin peliculas vistas." />
        <article className="netflix-panel p-4">
          <h2 className="text-xl font-black">Comentarios</h2>
          <div className="mt-3 space-y-3">
            {userComments.length ? userComments.slice(0, 8).map((comment) => (
              <div key={comment.id} className="rounded-sm border border-white/10 bg-black/25 p-3">
                <p className="text-xs font-bold text-blue-300">{comment.movieTitle}</p>
                <p className="mt-1 line-clamp-3 text-sm text-white/75">{comment.body}</p>
              </div>
            )) : <p className="text-sm text-white/55">Sin comentarios publicados.</p>}
          </div>
        </article>
      </div>
    </section>
  );
}

function Panel({ title, items, empty }) {
  return (
    <article className="netflix-panel p-4">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-3 space-y-3">
        {items.length ? items.slice(0, 8).map((item) => (
          <Link
            key={`${title}-${item.id}`}
            href={`/peli/${item.id}`}
            className="block rounded-sm border border-white/10 bg-black/25 p-3 transition hover:bg-white/8"
          >
            <p className="line-clamp-1 text-sm font-bold text-white">{item.title}</p>
            <p className="mt-1 text-xs text-white/52">TMDB {Number(item.vote_average ?? 0).toFixed(1)}/10</p>
          </Link>
        )) : <p className="text-sm text-white/55">{empty}</p>}
      </div>
    </article>
  );
}
