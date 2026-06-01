import UserPanel from "@/components/user/UserPanel";

export const metadata = {
  title: "Panel de usuario",
  description: "Gestiona perfil, favoritos, historial, comentarios y configuracion de cuenta.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function UsuarioPage() {
  return (
    <main className="mx-auto w-full max-w-[1220px] space-y-6 px-4 py-4 text-white sm:px-6 lg:px-8">
      <section className="netflix-panel p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
          Cuenta
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase sm:text-4xl">
          Panel de usuario
        </h1>
        <p className="mt-2 text-sm text-white/70 sm:text-base">
          Registro, inicio de sesion, perfil, avatar, favoritos, historial y comentarios.
        </p>
      </section>
      <UserPanel />
    </main>
  );
}
