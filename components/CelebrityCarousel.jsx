"use client";

// import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useRef } from "react";

const celebrities = [
    { name: "Ryan Gosling", rank: 5, change: -1 },
    { name: "Elle Fanning", rank: 6, change: +19 },
    { name: "Zendaya", rank: 7, change: -3 },
    { name: "Camila Morrone", rank: 8, change: -6 },
    { name: "Joel Kinnaman", rank: 9, change: -6 },
    { name: "Phoebe Dynevor", rank: 10, change: +59 },
    { name: "Ryan Gosling", rank: 5, change: -1 },
    { name: "Elle Fanning", rank: 6, change: +19 },
    { name: "Zendaya", rank: 7, change: -3 },
    { name: "Camila Morrone", rank: 8, change: -6 },
    { name: "Joel Kinnaman", rank: 9, change: -6 },

];

export default function CelebrityCarousel() {
    const scrollRef = useRef(null);

    const scroll = (dir) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({
            left: dir === "left" ? -300 : 300,
            behavior: "smooth",
        });
    };

    return (
        <div className="w-full bg-black text-white px-4 py-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-yellow-400"></span>
                Celebridades más populares
            </h2>

            <div className="relative">
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-zinc-900/80 p-2 rounded-full"
                >
                    {/* <ChevronLeft /> */}
                </button>

                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto px-8"
                >
                    {celebrities.map((celeb, i) => (
                        <div key={i} className="flex flex-col items-center min-w-[120px]">
                            <div className="relative w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-2xl text-blue-400">
                                {celeb.name.charAt(0)}

                                <div className="absolute bottom-1 right-1 bg-black p-1 rounded-full">
                                    {/* <Heart size={14} /> */}
                                </div>
                            </div>

                            <p className="mt-2 text-sm text-center">{celeb.name}</p>

                            <div className="text-xs flex gap-1">
                                <span>{celeb.rank}</span>
                                <span className={celeb.change > 0 ? "text-green-400" : "text-red-400"}>
                                    ({celeb.change > 0 ? "+" : ""}
                                    {celeb.change})
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-zinc-900/80 p-2 rounded-full"
                >
                    {/* <ChevronRight /> */}
                </button>
            </div>
        </div>
    );
}