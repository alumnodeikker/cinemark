"use client";

import Image from "next/image";
import BotonFavorito from "./BotonFavorito";
import Link from "next/link";

export default function TarjetaPeli({
  id = null,
  titulo = "Peli",
  descripcion = "Descripcion",
  rating = 0,
  imagenPath = null,
  pelicula = null,
  onFavoritoChange = null,
}) {
  const imageUrl = imagenPath
    ? `https://image.tmdb.org/t/p/w500${imagenPath}`
    : null;

  const Card = (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 w-64">
      <div className="flex justify-between items-center mb-3">
        <span className="bg-yellow-500 text-black font-bold px-2 py-1 rounded text-sm">
          * {Math.round(rating * 10) / 10}
        </span>

        <BotonFavorito
          pelicula={
            pelicula ?? {
              id,
              title: titulo,
              overview: descripcion,
              vote_average: rating,
              poster_path: imagenPath,
            }
          }
          onChange={onFavoritoChange}
        />
      </div>

      <div className="bg-gray-700 h-40 rounded mb-3 flex items-center justify-center relative overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={titulo}
            fill
            sizes="256px"
            className="object-cover"
          />
        ) : (
          <span className="text-gray-500">Sin imagen</span>
        )}
      </div>

      <div className="text-white">
        <h3 className="font-bold text-lg mb-2">{titulo}</h3>
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{descripcion}</p>

        <div className="flex gap-2">
          <button className="bg-yellow-500 text-black px-3 py-1 rounded font-bold text-sm hover:bg-yellow-600">
            Ver
          </button>
          <button className="border border-gray-400 text-white px-3 py-1 rounded text-sm hover:border-yellow-500 hover:text-yellow-500">
            Mi Lista
          </button>
        </div>
      </div>
    </div>
  );
  return id ? <Link href={`/peli/${id}`}>{Card}</Link> : Card;
}
