import ContenedorBusqueda from "@/components/ContenedorBusqueda";
import { fetchBusqueda } from "@/lib/Api_";
import TarjetaPeli from "@/components/TarjetaPeli";





export default async function Buscar({ searchParams }) {
  const { q } = await searchParams; // En Next.js 15+ searchParams es una Promise
  const data = q ? await fetchBusqueda(q) : null; // Tráeme los datos de la API, si no trae nada. null


  return (
   <div className="flex flex-col gap-8" > 
      <ContenedorBusqueda />
      {q ? (
        <>
          {/* Resultados */}
          
          {data?.results?.length > 0 && (
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.results.map((p) => (
                <TarjetaPeli key={p.id} 
                peliData={p} />
              ))}
            </section>
          )}

          {/* Sin resultados */}
          {data?.results?.length === 0 && (
            <p>No se encontraron películas para {q}</p>
          )}
        </>
      ) : (
        /* Estado vacío */
        <div>
         
        
        </div>
      )}
    </div> 
  );
}
