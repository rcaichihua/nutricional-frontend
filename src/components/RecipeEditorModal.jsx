// src/components/RecipeEditorModal.jsx
import { useEffect, useState } from "react";
import { X, PlusCircle, Trash2 } from "lucide-react";

export default function RecipeEditorModal({ open, onClose, receta, alimentos, onGuardar }) {
  const [nombre, setNombre] = useState("");
  const [ingredientes, setIngredientes] = useState([]);

  // Al abrir, si estamos editando, precarga los datos
  useEffect(() => {
    if (receta) {
      setNombre(receta.nombre);
      setIngredientes(receta.ingredientes);
    } else {
      setNombre("");
      setIngredientes([]);
    }
  }, [receta, open]);

  // Agregar nuevo ingrediente vacío
  const handleAddIngrediente = () => {
    setIngredientes((prev) => [
      ...prev,
      { alimento_id: "", nombre: "", cantidad: "", unidad: "gr" },
    ]);
  };

  // Modifica un ingrediente (por índice)
  const handleIngredienteChange = (idx, campo, valor) => {
    setIngredientes((prev) =>
      prev.map((ing, i) =>
        i === idx
          ? campo === "alimento_id"
            ? {
                ...ing,
                alimento_id: valor,
                nombre:
                  alimentos.find((a) => a.id === Number(valor))
                    ?.nombre_alimento || "",
              }
            : { ...ing, [campo]: valor }
          : ing
      )
    );
  };

  // Eliminar ingrediente
  const handleRemoveIngrediente = (idx) => {
    setIngredientes((prev) => prev.filter((_, i) => i !== idx));
  };

  // Guardar receta
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return alert("Ponle un nombre a la receta.");
    if (ingredientes.length === 0) return alert("Agrega al menos un ingrediente.");
    onGuardar({
      ...(receta ? { id: receta.id } : {}),
      nombre,
      ingredientes,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <form
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative"
        onSubmit={handleSubmit}
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          <X size={28} />
        </button>
        <h2 className="text-2xl font-bold mb-2">{receta ? "Editar Receta" : "Crear Nueva Receta"}</h2>
        <label className="block mb-3 font-semibold">
          Nombre del Plato
          <input
            className="mt-1 w-full border px-4 py-2 rounded-xl bg-gray-50 font-semibold"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Lentejas con Arroz"
            required
          />
        </label>
        <div>
          <span className="block mb-2 font-semibold">Ingredientes (por porción)</span>
          {ingredientes.map((ing, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <select
                className="flex-1 border rounded-xl px-2 py-1 bg-gray-50"
                value={ing.alimento_id}
                onChange={(e) =>
                  handleIngredienteChange(idx, "alimento_id", e.target.value)
                }
                required
              >
                <option value="">Elige alimento...</option>
                {alimentos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre_alimento}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="w-24 border rounded-xl px-2 py-1 bg-gray-50"
                placeholder="Cant."
                value={ing.cantidad}
                onChange={(e) =>
                  handleIngredienteChange(idx, "cantidad", e.target.value)
                }
                min={1}
                required
              />
              <input
                type="text"
                className="w-16 border rounded-xl px-2 py-1 bg-gray-50"
                value={ing.unidad}
                onChange={(e) =>
                  handleIngredienteChange(idx, "unidad", e.target.value)
                }
                placeholder="gr"
                required
              />
              <button
                type="button"
                className="text-red-400 hover:text-red-600"
                onClick={() => handleRemoveIngrediente(idx)}
              >
                <Trash2 />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 mt-2"
            onClick={handleAddIngrediente}
          >
            <PlusCircle size={20} /> Añadir Ingrediente
          </button>
        </div>
        <div className="flex gap-2 mt-8">
          <button
            type="button"
            className="w-1/2 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-1/2 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition"
          >
            {receta ? "Guardar Cambios" : "Guardar Receta"}
          </button>
        </div>
      </form>
    </div>
  );
}

