import { movieInitial } from "@/lib/movieAssets";

export default function ImagePlaceholder({
  title = "Cinemark",
  label = "Imagen no disponible",
  className = "",
}) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,rgba(79,140,255,0.2),transparent_38%),linear-gradient(160deg,#121722,#050505)] text-center ${className}`}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-blue-300/35 bg-blue-600/20 text-2xl font-black text-blue-200">
        {movieInitial(title)}
      </span>
      <span className="mt-3 px-4 text-xs font-bold uppercase tracking-[0.18em] text-white/52">
        {label}
      </span>
    </div>
  );
}
