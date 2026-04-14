import { fetchPeli } from '@/lib/Api_';
import Image from 'next/image'; // importar Image



export default async function FichaPelicula({ params }) {


    const { vin } = await params;
    const peli = await fetchPeli(vin);
    const trailerKey = peli.videos?.results?.find(v => v.type === "Trailer")?.key;
    const trailerUrl = `https://youtube-nocookie.com/embed/${trailerKey}?rel=0&modestbranding=1`;


    // 1. Definimos la variable imagenPath extrayéndola de 'peli'
    const imagenPath = peli.poster_path;

    // 2. Definimos imageUrl AQUÍ adentro
    const imageUrl = imagenPath
        ? `https://image.tmdb.org/t/p/w500${imagenPath}`
        : null;
    console.log(trailerKey)

    return (
        <main className="relative min-h-screen bg-[#141414] text-white overflow-hidden font-sans w-full">

            {/* 1. Fondo Hero (Backdrop) opcional para el look Netflix */}
            <div className="absolute top-0 left-0 w-full h-[70vh] z-0">
                {peli.backdrop_path && (
                    <Image
                        src={`https://image.tmdb.org/t/p/original${peli.backdrop_path}`}
                        alt=""
                        fill
                        className="object-cover opacity-40"
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-[#141414]/60" />
            </div>

            {/* 2. Contenido Principal */}
            <div className="relative z-10 pt-40 px-6 md:px-16 flex flex-col md:flex-row gap-10 items-center md:items-end">

                {/* TU BLOQUE DE IMAGEN MANTENIDO */}
                {imageUrl && (
                    <div className="relative w-64 h-96 flex-shrink-0 shadow-2xl rounded-md overflow-hidden border border-white/10">
                        <Image
                            src={imageUrl}
                            alt={peli.title}
                            fill
                            sizes="256px"
                            className="object-cover"
                        />
                    </div>
                )}

                {/* Información al estilo Netflix */}
                <div className="max-w-2xl mb-4 text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter drop-shadow-xl">
                        {peli.title}
                    </h1>

                    <div className="flex items-center justify-center md:justify-start gap-4 mb-6 text-sm font-semibold">
                        <span className="text-green-400 font-bold">
                            {Math.round(peli.vote_average * 10)}% de coincidencia
                        </span>
                        <span className="text-gray-400">{peli.release_date?.split('-')[0]}</span>
                        <span className="border border-gray-500 px-1.5 py-0.5 text-[10px] rounded">HD</span>
                    </div>

                    <p className="text-lg text-gray-200 leading-relaxed line-clamp-4 drop-shadow-md">
                        {peli.overview}
                    </p>

                    {/* Botones de acción */}
                    <div className="flex gap-3 mt-8 justify-center md:justify-start">
                        <button
                            type="button"
                            className="bg-white text-black px-8 py-2 rounded-md font-bold flex items-center gap-2 hover:bg-white/80 transition active:scale-95"
                        >
                            <span className="text-xl">▶</span> Reproducir
                        </button>
                        <button className="bg-gray-500/50 text-white px-8 py-2 rounded-md font-bold flex items-center gap-2 hover:bg-gray-500/40 transition backdrop-blur-md border border-white/10 active:scale-95">
                            <span className="text-xl">ⓘ</span> Más información
                        </button>
                    </div>

                    {/* <div className="mt-6 w-full max-w-3xl aspect-video rounded-md overflow-hidden border border-white/10 shadow-2xl mx-auto md:mx-0">
                        <iframe
                            src="https://goodstream.one/embed-mjtks7fpbkf7.html"
                            title="Reproductor"               
                            allowFullScreen
                            className="w-full h-full"
                        />
                    </div> */}

                </div>

                <div className="flex gap-3 mt-8">
                    {/* 4. AQUÍ USAMOS trailerUrl */}
                    {trailerUrl ? (
                        <a
                            href={trailerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-black px-8 py-2.5 rounded font-bold"
                        >
                            ▶ Trailer
                        </a>
                    ) : (
                        <button className="bg-gray-700 text-gray-400 px-8 py-2.5 rounded cursor-not-allowed">
                            No hay Trailer
                        </button>
                    )}


{/* //Video inscruptado  */}
                    
                </div>
                <iframe src={trailerUrl}
                    title={`tráiler de ${peli.title} `} ></iframe>

                <div>

                
                </div>
            </div >
        </main >
    );

}
