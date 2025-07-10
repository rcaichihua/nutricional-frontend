import React from "react";
import { X } from "lucide-react";

export default function SelectRecipeModal({
  open,
  onClose,
  recetas,
  onSelect,
  dia,
  comida,
  seleccionadas,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          <X size={28} />
        </button>
        <h3 className="text-2xl font-bold mb-2">Seleccionar Receta</h3>
        <p className="text-gray-500 mb-6">
          Para: <b>{comida}</b> del <b>{dia}</b>
        </p>
        <div className="space-y-3">
          {recetas.length === 0 ? (
            <div className="text-center text-gray-400 py-6">
              No hay recetas registradas
            </div>
          ) : (
            recetas.map((receta) => {
              // Saber si ya está agregada
              const yaAgregada = !!(
                seleccionadas &&
                seleccionadas[dia]?.[comida]?.some((r) => r.recetaId === receta.recetaId)
              );
              return (
                <button
                  key={receta.recetaId}
                  className={
                    "w-full text-left p-4 rounded-xl border border-gray-200 transition font-semibold flex flex-col " +
                    (yaAgregada
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                      : "hover:bg-blue-50")
                  }
                  onClick={() => !yaAgregada && onSelect(receta)}
                  disabled={yaAgregada}
                >
                  <span className="text-lg">{receta.nombre}</span>
                  <span className="text-gray-500 text-sm">
                    {receta.insumos && receta.insumos.length > 0
                      ? receta.insumos.map((i) => i.nombreInsumo).join(", ")
                      : ""}
                  </span>
                  {yaAgregada && (
                    <span className="text-xs mt-1">Ya seleccionada</span>
                  )}
                </button>
              );
            })
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
