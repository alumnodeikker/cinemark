"use client";

import Image from "next/image";
// import { Play } from "lucide-react";

export default function FeaturedHero() {
  return (
    <div className="w-full bg-black text-white">
      <div className="relative flex flex-col lg:flex-row gap-4 p-4">
        
        {/* HERO PRINCIPAL */}
        <div className="relative flex-1 h-[400px] rounded-2xl overflow-hidden group">
          <Image
            src="/hero.jpg" // reemplaza con tu imagen
            alt="featured"
            fill
            className="object-cover group-hover:scale-105 transition duration-500"
          />

          {/* overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

          {/* contenido */}
          <div className="absolute bottom-6 left-6 max-w-md">
            <h2 className="text-2xl lg:text-3xl font-bold mb-2">
              Man on Fire
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              Yahya Abdul-Mateen protagoniza esta nueva versión llena de acción.
            </p>

            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-full transition">
              {/* <Play size={18} /> */}
              Ver Trailer
            </button>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="w-full lg:w-[320px] bg-zinc-900 rounded-2xl p-4">
          <h3 className="text-blue-400 font-semibold mb-4">
            A continuación
          </h3>

          <div className="flex flex-col gap-3">
            {[
              {
                title: "Eric Dane Through the Years",
                time: "1:05",
                img: "/thumb1.jpg",
              },
              {
                title: "The Vampire Lestat",
                time: "1:56",
                img: "/thumb2.jpg",
              },
              {
                title: "Leviticus",
                time: "1:50",
                img: "/thumb3.jpg",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex gap-3 items-center hover:bg-zinc-800 p-2 rounded-lg cursor-pointer transition"
              >
                <div className="relative w-20 h-12 rounded overflow-hidden">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  <span className="text-xs text-gray-400">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-4 text-blue-400 hover:text-blue-300 text-sm">
            Explorar trailers →
          </button>
        </div>
      </div>
    </div>
  );
}