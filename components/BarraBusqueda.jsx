export default function BarraBusqueda() {
  return (
    <div className="w-full max-w-2xl px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-8">Buscar Películas</h1>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Busca tu película favorita..."
            
           
            className="w-full px-6 py-4 pr-12 text-lg rounded-full bg-gray-800 text-white placeholder-gray-400 border-2 border-gray-700 focus:outline-none focus:border-red-600 transition-all duration-300 shadow-lg hover:border-gray-600"
          />
          <svg 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

      </div>
      <div className="mt-6 text-center text-sm text-gray-400">
        Busca entre miles de películas
      </div>
    </div>
  );
}
