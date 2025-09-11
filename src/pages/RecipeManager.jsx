import { useState } from "react";
// 1. Se importa el nuevo ícono 'Copy'
import { PlusCircle, Edit, Trash2, Eye, X, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { useRecetas } from "../hooks/useRecetas";
import RecetaFormModal from "../components/RecetaFormModal";
import RecetaNutritionalDetail from "../components/RecetaNutritionalDetail";

export default function RecipeManager({ onVerDetalle }) {
  const {
    recetasConInsumos,
    loadingRecetasConInsumos: loading,
    saveReceta,
    deleteReceta,
    page,
    totalPages,
    goToNextPage,
    goToPreviousPage,
  } = useRecetas({ onlyConInsumos: true });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReceta, setSelectedReceta] = useState(null);
  const [detalleRecetaId, setDetalleRecetaId] = useState(null);

  const openModal = (receta = null) => {
    setSelectedReceta(receta);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedReceta(null);
  };

  // --- 2. NUEVA FUNCIÓN PARA MANEJAR LA COPIA DE RECETAS ---
  const handleCopy = (recetaToCopy) => {
    // Se crea una copia profunda del objeto para no modificar el original
    const copiedReceta = JSON.parse(JSON.stringify(recetaToCopy));

    // Se elimina el ID para que sea tratada como una nueva receta
    delete copiedReceta.recetaId;

    // Se modifica el nombre para indicar que es una copia
    copiedReceta.nombre = `${copiedReceta.nombre} - Copia`;

    // Se abre el modal con los datos de la receta copiada
    openModal(copiedReceta);
  };

  const handleSaveReceta = async (recetaData) => {
    try {
      const ok = await saveReceta(recetaData, closeModal);
      if (ok) {
        alert(
          // Se ajusta el mensaje para diferenciar entre crear, editar y copiar
          recetaData.recetaId
            ? "Receta actualizada exitosamente"
            : "Receta creada exitosamente"
        );
      }
    } catch (error) {
      console.error("Error al guardar receta:", error);
      alert("Error al guardar la receta");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta receta?")) {
      try {
        await deleteReceta(id);
      } catch (error) {
        alert("Error al eliminar la receta: " + error.message);
      }
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-700 flex items-center">
          <PlusCircle className="mr-2 text-purple-600" size={26} /> Gestor de
          Recetas
        </h2>
        <button
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md hover:shadow-lg transition-all"
          onClick={() => openModal(null)}
        >
          <PlusCircle size={18} className="mr-2" /> Crear Nueva Receta
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-gray-500">Cargando recetas...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
            {recetasConInsumos.map((receta) => (
              <div
                key={receta.recetaId}
                className="border border-gray-200 rounded-xl p-4 bg-white shadow flex flex-col justify-between relative"
              >
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {receta.nombre}
                  </h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 my-2 pl-2">
                    {(receta.insumos || []).map((insumo, i) => (
                      <li key={i}>
                        {insumo.nombreInsumo} ({insumo.cantidadEnReceta ?? insumo.cantidad} {insumo.unidadMedida ?? insumo.unidad})
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-end space-x-2 mt-2">
                  <button
                    className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                    onClick={() => onVerDetalle ? onVerDetalle(receta.recetaId) : setDetalleRecetaId(receta.recetaId)}
                    title="Ver detalle"
                  >
                    <Eye size={18} />
                  </button>
                  {/* --- 3. NUEVO BOTÓN DE COPIAR --- */}
                  <button
                    className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full"
                    onClick={() => handleCopy(receta)}
                    title="Copiar Receta"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                    onClick={() => openModal(receta)}
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                    onClick={() => handleDelete(receta.recetaId)}
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-4">
              <button
                onClick={goToPreviousPage}
                disabled={page <= 1}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>
              <span className="font-semibold text-gray-700">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={page >= totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Siguiente
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <RecetaFormModal
          receta={selectedReceta}
          onSave={handleSaveReceta}
          onClose={closeModal}
          isOpen={modalOpen}
        />
      )}
      {detalleRecetaId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setDetalleRecetaId(null)}
            >
              <X size={28} />
            </button>
            <RecetaNutritionalDetail id={detalleRecetaId} />
          </div>
        </div>
      )}
    </div>
  );
}

