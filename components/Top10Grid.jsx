"use client";

const top10 = [
  { title: "The Boys", rank: 1, desc: "Un grupo de vigilantes lucha contra superhéroes corruptos." },
  { title: "The Pitt", rank: 2, desc: "Drama hospitalario con crisis personales y profesionales." },
  { title: "Proyecto Fin del Mundo", rank: 3, desc: "Un astronauta intenta salvar la Tierra." },
  { title: "Bronca", rank: 4 },
  { title: "Invincible", rank: 5 },
  { title: "Euphoria", rank: 6 },
  { title: "La momia", rank: 7 },
  { title: "Street Fighter", rank: 8 },
  { title: "Trash", rank: 9 },
  { title: "Compañeras de cuarto", rank: 10 },
];

export default function Top10Grid() {
  return (
    <div className="bg-black text-white px-4 py-8">
      
      {/* Header */}
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-600"></span>
        Mejores 10 en esta semana
      </h2>

      {/* Top 3 grandes */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {top10.slice(0, 3).map((item) => (
          <div
            key={item.rank}
            className="bg-zinc-900 rounded-xl p-4 flex gap-4 hover:bg-zinc-800 transition"
          >
            {/* Poster fake */}
            <div className="w-24 h-36 rounded-lg bg-gradient-to-br from-blue-700 to-zinc-800 flex items-center justify-center text-3xl font-bold">
              {item.rank}
            </div>

            {/* Info */}
            <div className="flex-1">
              <span className="bg-blue-600 text-xs px-2 py-1 rounded">
                #{item.rank}
              </span>

              <h3 className="mt-2 font-semibold">{item.title}</h3>

              <p className="text-sm text-gray-400 mt-2 line-clamp-3">
                {item.desc}
              </p>

              <div className="mt-3 text-sm text-blue-400 cursor-pointer hover:underline">
                Calificar
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid 4–10 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
        {top10.slice(3).map((item) => (
          <div
            key={item.rank}
            className="bg-zinc-900 rounded-lg p-2 hover:bg-zinc-800 transition"
          >
            {/* Poster fake */}
            <div className="relative w-full h-40 rounded-md bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-xl font-bold">
              {item.rank}

              {/* rank badge */}
              <span className="absolute top-1 left-1 bg-blue-600 text-xs px-2 py-0.5 rounded">
                #{item.rank}
              </span>
            </div>

            <p className="text-xs mt-2 text-center">{item.title}</p>
          </div>
        ))}
      </div>

      {/* Botón */}
      <div className="flex justify-center mt-8">
        <button className="bg-zinc-800 hover:bg-zinc-700 px-6 py-2 rounded-full text-sm">
          Ver todo
        </button>
      </div>
    </div>
  );
}