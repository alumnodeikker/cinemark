'use client';

import { useEffect, useState } from 'react';
import { traerPeliculas } from '../lib/Api_';
import TarjetaPeli from './TarjetaPeli';

export default function ContenedorPelisFamosas() {
    const [peliculas, setPeliculas] = useState([]);

    useEffect(() => {
        traerPeliculas().then(datos => {
            setPeliculas(datos);
        });
    }, []);

    return (
        <main>
            <div className="flex flex-wrap gap-4 p-4">
                
                {peliculas.map(peli => (
                    <TarjetaPeli 
                        key={peli.id}
                        id={peli.id}
                        titulo={peli.title}
                        descripcion={peli.overview}
                        rating={peli.vote_average}
                        imagenPath={peli.poster_path}
                        pelicula={peli}
                    />
                ))}
            </div>
        </main>
    );
}
