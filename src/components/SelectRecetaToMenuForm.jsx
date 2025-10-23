import { useState, useEffect } from "react";
import { X, Search, PlusCircle, Trash2 } from "lucide-react";

export default function SelectRecetaToMenuForm({
  open,
  onClose,
  recetasDisponibles,
  allRecetas,
  searchTerm,
  onSearchTermChange,
  isLoading,
  onSave,
  saveError,
  seleccionadas: seleccionadasIniciales = [],
  tituloInicial = "",
}) {
  const [titulo, setTitulo] = useState(tituloInicial);
  const [recetasSeleccionadas, setRecetasSeleccionadas] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Efecto optimizado para inicializar las recetas seleccionadas.
  useEffect(() => {
    // Solo ejecuta la lógica si el modal está abierto, si tenemos la lista completa de recetas,
    // y si hay recetas iniciales para seleccionar.
    if (open && allRecetas && allRecetas.length > 0 && seleccionadasIniciales && seleccionadasIniciales.length > 0) {
        
        const fullSelectedRecetas = seleccionadasIniciales
        .map(selReceta => {
            // Lógica de comparación robusta (sin cambios, ya era correcta)
            const match = allRecetas.find(r => {
                const allRecetasId = r.recetaId || r.id;
                const initialRecetaId = selReceta.recetaId || selReceta.id;
                return allRecetasId !== undefined && String(allRecetasId) === String(initialRecetaId);
            });
            // Si no hay match, filtramos más adelante con .filter(Boolean)
            return match;
        })
        .filter(Boolean); // Elimina cualquier 'undefined' si no hubo coincidencia

        setRecetasSeleccionadas(fullSelectedRecetas);
    } else if (open) {
        // Si el modal está abierto pero no hay recetas iniciales (modo Crear),
        // nos aseguramos de que la lista esté vacía.
        setRecetasSeleccionadas([]);
    }
    // Añadimos 'open' como dependencia para resetear al abrir/cerrar si es necesario.
  }, [open, seleccionadasIniciales, allRecetas]);

  const handleAddReceta = (receta) => {
    if (!recetasSeleccionadas.some(r => r.recetaId === receta.recetaId)) {
      setRecetasSeleccionadas([...recetasSeleccionadas, receta]);
    }
  };

  const handleRemoveReceta = (recetaId) => {
    setRecetasSeleccionadas(recetasSeleccionadas.filter(r => r.recetaId !== recetaId));
  };

  const handleGuardar = async () => {
    setIsSaving(true);
    console.log("Recetas a incluir:",recetasSeleccionadas)
    await onSave({ titulo, recetas: recetasSeleccionadas });
    setIsSaving(false);
  };

  const isFormValid = titulo.trim() !== "" && recetasSeleccionadas.length > 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Cabecera */}
        <header className="p-6 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">
            {tituloInicial ? "Editar Menú" : "Crear Nuevo Menú"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <X size={24} />
          </button>
        </header>

        {/* Cuerpo */}
        <main className="p-6 flex-grow overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna Izquierda */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-lg">Recetas Disponibles</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar receta por nombre..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
              />
            </div>
            <div className="border border-gray-200 rounded-lg flex-grow overflow-y-auto h-96">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500">Cargando recetas...</div>
              ) : recetasDisponibles.length > 0 ? (
                <ul>
                  {recetasDisponibles.map(receta => (
                    <li key={receta.recetaId} className="border-b last:border-b-0">
                      <button
                        onClick={() => handleAddReceta(receta)}
                        className="w-full text-left p-3 hover:bg-purple-50 transition-colors flex justify-between items-center"
                      >
                        <span className="font-medium text-gray-700">{receta.nombre}</span>
                        <PlusCircle size={18} className="text-green-500" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-center p-4">No se encontraron recetas que coincidan con la búsqueda.</div>
              )}
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-lg">Menú Actual</h3>
            <div>
              <label htmlFor="menu-title" className="block text-sm font-medium text-gray-700 mb-1">Título del Menú</label>
              <input
                id="menu-title"
                type="text"
                placeholder="Ej: Menú Semanal Octubre"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
              />
            </div>
            <div className="border border-gray-200 rounded-lg flex-grow overflow-y-auto h-96">
              {recetasSeleccionadas.length > 0 ? (
                <ul>
                  {recetasSeleccionadas.map(receta => (
                    <li key={receta.recetaId} className="border-b last:border-b-0 p-3 flex justify-between items-center">
                      <span className="font-medium text-gray-700">{receta.nombre}</span>
                      <button onClick={() => handleRemoveReceta(receta.recetaId)} title="Quitar receta">
                        <Trash2 size={18} className="text-red-500 hover:text-red-700" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-center p-4">Añade recetas desde la lista de la izquierda.</div>
              )}
            </div>
          </div>
        </main>

        {/* Pie */}
        <footer className="p-6 border-t border-gray-200 flex justify-end items-center gap-4 flex-shrink-0">
          {saveError && <p className="text-red-600 text-sm mr-auto">{saveError}</p>}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={!isFormValid || isSaving}
            className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSaving ? "Guardando..." : "Guardar Menú"}
          </button>
        </footer>
      </div>
    </div>
  );
}

