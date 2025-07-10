import React, { useState } from "react";
import { PlusCircle, Edit, Trash2, Eye, X } from "lucide-react";
import { useRecetas } from "../hooks/useRecetas";
import RecetaFormModal from "../components/RecetaFormModal";
import RecetaNutritionalDetail from "../components/RecetaNutritionalDetail";
import { TablaRecetasConInsumos } from "../components/TableRecetasConInsumos";

export default function RecipeManager({ onVerDetalle }) {
  const {
    recetasConInsumos,
    loadingRecetasConInsumos: loading,
    errorRecetasConInsumos: error,
    refetchRecetasConInsumos: refetch,
    saveReceta,
    deleteReceta,
  } = useRecetas();

  // console.log("recetasConInsumos de useRecetas", recetasConInsumos);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReceta, setSelectedReceta] = useState(null);
  const [detalleRecetaId, setDetalleRecetaId] = useState(null);

  // Modal para crear/editar receta
  const openModal = (receta = null) => {
    setSelectedReceta(receta);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedReceta(null);
  };

  // Guardar receta
  const handleSaveReceta = async (recetaData) => {
    try {
      const ok = await saveReceta(recetaData, closeModal);
      if (ok) {
        refetch(); // Recargar la lista de recetas con insumos
        alert(
          selectedReceta
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
    if (window.confirm("¿Eliminar receta?")) {
      try {
        await deleteReceta(id, refetch);
      } catch (error) {
        alert("Error al eliminar la receta");
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
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md hover:shadow-lg transition-all"
          onClick={() => openModal(null)}
        >
          <PlusCircle size={18} className="mr-2" /> Crear Nueva Receta
        </button>
      </div>
      {/* Lista de recetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recetasConInsumos.map((receta) => (
          <div
            key={receta.recetaId}
            className="border border-gray-200 rounded-xl p-4 bg-white shadow flex flex-col justify-between"
          >
            <div>
              <h3 className="font-bold text-lg text-gray-800">
                {receta.nombre}
              </h3>
              <ul className="list-disc list-inside text-sm text-gray-600 my-2 pl-2">
                {receta.insumos.map((insumo, i) => (
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
              <button
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                onClick={() => openModal(receta)}
              >
                <Edit size={18} />
              </button>
              <button
                className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                onClick={() => handleDelete(receta.recetaId)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* MODAL DE FORMULARIO */}
      {modalOpen && (
        <RecetaFormModal
          receta={selectedReceta}
          onSave={handleSaveReceta}
          onClose={closeModal}
          isOpen={modalOpen}
        />
      )}
      {/* MODAL DE DETALLE */}
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
      {/* <TablaRecetasConInsumos /> */}
    </div>
  );
}
