import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function SelectRecetaToMenuForm({
  open,
  onClose,
  recetas,
  onSave,
  seleccionadas,
  tituloInicial = ""
}) {
  const [seleccionLocal, setSeleccionLocal] = useState([]);
  const [tituloMenu, setTituloMenu] = useState("");

  useEffect(() => {
    setSeleccionLocal(seleccionadas || []);
    setTituloMenu(tituloInicial || "");
  }, [seleccionadas, tituloInicial, open]);

  if (!open) return null;

  const toggleReceta = (receta) => {
    const existe = seleccionLocal.some((r) => r.recetaId === receta.recetaId);
    if (existe) {
      setSeleccionLocal(seleccionLocal.filter((r) => r.recetaId !== receta.recetaId));
    } else {
      setSeleccionLocal([...seleccionLocal, receta]);
    }
  };

  const handleGuardar = async () => {
    if (typeof onSave === 'function') {
      try {
        const ok = await onSave({ titulo: tituloMenu, recetas: seleccionLocal });
        if (ok) {
          alert(
            seleccionadas && seleccionadas.length > 0
              ? "Menú actualizado exitosamente"
              : "Menú creado exitosamente"
          );
          onClose();
        }
      } catch (error) {
        console.error("Error al guardar menú:", error);
        alert("Error al guardar el menú");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-10 relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          <X size={28} />
        </button>
        <h3 className="text-2xl font-bold mb-2">Seleccionar Receta</h3>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1" htmlFor="tituloMenu">Título del menú</label>
          <input
            id="tituloMenu"
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={tituloMenu}
            onChange={e => setTituloMenu(e.target.value)}
            placeholder="Ejemplo: Menú especial"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 max-h-72 overflow-y-auto">
          {recetas.length === 0 ? (
            <div className="text-center text-gray-400 py-6">
              No hay recetas registradas
            </div>
          ) : (
            recetas.map((receta) => {
              const seleccionada = seleccionLocal.some(
                (r) => r.recetaId === receta.recetaId
              );
              return (
                <button
                  key={receta.recetaId}
                  className={
                    "w-full text-left p-4 rounded-xl border border-gray-200 transition font-semibold flex flex-col " +
                    (seleccionada
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-blue-50")
                  }
                  onClick={() => toggleReceta(receta)}
                >
                  <span className="text-lg">{receta.nombre}</span>
                  <span className="text-gray-500 text-sm">
                    {receta.insumos && receta.insumos.length > 0
                      ? receta.insumos.map((i) => i.nombreInsumo).join(", ")
                      : ""}
                  </span>
                  {seleccionada && (
                    <span className="text-xs mt-1">Seleccionada</span>
                  )}
                </button>
              );
            })
          )}
        </div>
        <div className="flex gap-4 mt-6">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className={
              "w-full py-3 rounded-xl font-semibold transition " +
              (seleccionLocal.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700")
            }
            disabled={seleccionLocal.length === 0}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
