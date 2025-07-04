import React, { useState } from "react";
import { PlusCircle, Edit, Trash2, Save, X } from "lucide-react";
import { useRecetasConInsumos } from "../hooks/useRecetasConInsumos";

const ALIMENTOS = [
  { id: 1, nombre: "Papa" },
  { id: 2, nombre: "Lentejas" },
  { id: 3, nombre: "Pollo" },
  { id: 4, nombre: "Arroz" },
  { id: 5, nombre: "Zanahoria" },
  { id: 6, nombre: "Cebolla" },
];

const RECETAS_DEMO = [
  {
    id: 1,
    nombre: "Lentejas con arroz",
    ingredientes: [
      { insumo: { id: 2, nombre: "Lentejas" }, cantidad: 100, unidad: "gr" },
      { insumo: { id: 4, nombre: "Arroz" }, cantidad: 80, unidad: "gr" },
    ],
  },
  {
    id: 2,
    nombre: "Pollo al horno",
    ingredientes: [
      { insumo: { id: 3, nombre: "Pollo" }, cantidad: 200, unidad: "gr" },
      { insumo: { id: 1, nombre: "Papa" }, cantidad: 120, unidad: "gr" },
    ],
  },
];

function TablaRecetasConInsumos() {
  const { recetasConInsumos, loading, error } = useRecetasConInsumos();
  const [recetaExpandida, setRecetaExpandida] = useState(null);

  if (loading) return <div className="text-center py-8">Cargando...</div>;
  if (error) return <div className="text-center text-red-500 py-8">Error al cargar recetas</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg shadow-sm bg-white">
        <thead>
          <tr className="bg-blue-100 text-gray-700">
            <th className="px-4 py-2 text-left">Receta</th>
            <th className="px-4 py-2 text-left">Porciones</th>
            <th className="px-4 py-2 text-left">Descripción</th>
            <th className="px-4 py-2 text-left">Insumos</th>
          </tr>
        </thead>
        <tbody>
          {recetasConInsumos.map((receta) => (
            <tr key={receta.recetaId} className="border-b hover:bg-blue-50 transition">
              <td className="px-4 py-2 font-semibold">{receta.nombre}</td>
              <td className="px-4 py-2">{receta.porciones}</td>
              <td className="px-4 py-2">{receta.descripcion ?? <span className="text-gray-400">-</span>}</td>
              <td className="px-4 py-2">
                <button
                  className="text-blue-600 hover:underline font-medium"
                  onClick={() =>
                    setRecetaExpandida(recetaExpandida === receta.recetaId ? null : receta.recetaId)
                  }
                >
                  {receta.insumos.length > 0
                    ? recetaExpandida === receta.recetaId
                      ? "Ocultar insumos"
                      : "Ver insumos"
                    : "Sin insumos"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tabla de insumos expandida */}
      {recetasConInsumos.map(
        (receta) =>
          recetaExpandida === receta.recetaId &&
          receta.insumos.length > 0 && (
            <div
              key={receta.recetaId + "-insumos"}
              className="my-2 mx-2 p-4 border border-blue-200 rounded-lg bg-blue-50"
            >
              <h4 className="font-bold mb-2 text-blue-700">Insumos de {receta.nombre}</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-blue-200">
                      <th className="px-2 py-1">Nombre</th>
                      <th className="px-2 py-1">Cantidad</th>
                      <th className="px-2 py-1">Kcal/100g</th>
                      <th className="px-2 py-1">Prot. animal</th>
                      <th className="px-2 py-1">Prot. vegetal</th>
                      <th className="px-2 py-1">CHO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receta.insumos.map((insumo) => (
                      <tr key={insumo.insumoId} className="border-b">
                        <td className="px-2 py-1">{insumo.nombreInsumo}</td>
                        <td className="px-2 py-1">{insumo.cantidadEnReceta} g</td>
                        <td className="px-2 py-1">{insumo.energiaKcalPor100g ?? "-"}</td>
                        <td className="px-2 py-1">{insumo.proteinaAnimalGPor100g ?? "-"}</td>
                        <td className="px-2 py-1">{insumo.proteinaVegetalGPor100g ?? "-"}</td>
                        <td className="px-2 py-1">{insumo.choCarbohidratoGPor100g ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
      )}
    </div>
  );
}

export default function RecipeManager() {
  const { recetasConInsumos, loading, error, refetch } = useRecetasConInsumos();

  // console.log("recetasConInsumos", recetasConInsumos);

  const [recetas, setRecetas] = useState(RECETAS_DEMO);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Form fields
  const [nombre, setNombre] = useState("");
  const [ingredientes, setIngredientes] = useState([
    { insumo: null, cantidad: "", unidad: "gr" },
  ]);

  // Modal para crear/editar receta
  const openModal = (receta = null) => {
    if (receta) {
      setEditing(receta.id);
      setNombre(receta.nombre);
      setIngredientes(
        receta.ingredientes.map((i) => ({
          insumo: i.insumo,
          cantidad: i.cantidad,
          unidad: i.unidad,
        }))
      );
    } else {
      setEditing(null);
      setNombre("");
      setIngredientes([{ insumo: null, cantidad: "", unidad: "gr" }]);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setNombre("");
    setIngredientes([{ insumo: null, cantidad: "", unidad: "gr" }]);
    setEditing(null);
  };

  // Guardar receta (nuevo o editar)
  const handleSave = () => {
    if (!nombre.trim()) return alert("Ponle nombre a la receta");
    if (!ingredientes.every((i) => i.insumo && i.cantidad > 0)) {
      return alert("Completa todos los ingredientes");
    }
    if (editing) {
      // Editar
      setRecetas((prev) =>
        prev.map((r) => (r.id === editing ? { ...r, nombre, ingredientes } : r))
      );
    } else {
      // Nuevo
      setRecetas((prev) => [
        ...prev,
        {
          id: Date.now(),
          nombre,
          ingredientes,
        },
      ]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar receta?")) {
      setRecetas((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Agregar/Eliminar ingrediente en el form
  const handleAddIng = () =>
    setIngredientes((ings) => [
      ...ings,
      { insumo: null, cantidad: "", unidad: "gr" },
    ]);
  const handleRemoveIng = (idx) =>
    setIngredientes((ings) => ings.filter((_, i) => i !== idx));

  // Cambios en ingrediente
  const handleIngChange = (idx, field, value) => {
    setIngredientes((ings) =>
      ings.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing))
    );
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
                    {insumo.nombreInsumo} ({insumo.cantidadEnReceta}{" "}
                    {insumo.unidad})
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-end space-x-2 mt-2">
              <button
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                onClick={() => openModal(receta)}
              >
                <Edit size={18} />
              </button>
              <button
                className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                onClick={() => handleDelete(receta.id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-lg relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={closeModal}
            >
              <X size={28} />
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {editing ? "Editar receta" : "Crear receta"}
            </h3>
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700">
                Nombre de la receta
              </label>
              <input
                className="border rounded-lg w-full py-3 px-4"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Lentejas con arroz"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700">
                Ingredientes
              </label>
              <div className="space-y-3">
                {ingredientes.map((ing, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg"
                  >
                    {/* Select insumo */}
                    <select
                      className="border rounded-lg px-2 py-2 flex-1"
                      value={ing.insumo?.id || ""}
                      onChange={(e) =>
                        handleIngChange(
                          idx,
                          "insumo",
                          ALIMENTOS.find((a) => a.id === Number(e.target.value))
                        )
                      }
                    >
                      <option value="">Selecciona insumo</option>
                      {ALIMENTOS.map((a) => (
                        <option value={a.id} key={a.id}>
                          {a.nombre}
                        </option>
                      ))}
                    </select>
                    <input
                      className="border rounded-lg w-24 px-2 py-2 text-center"
                      type="number"
                      min={1}
                      placeholder="Cantidad"
                      value={ing.cantidad}
                      onChange={(e) =>
                        handleIngChange(idx, "cantidad", e.target.value)
                      }
                    />
                    <select
                      className="border rounded-lg px-2 py-2"
                      value={ing.unidad}
                      onChange={(e) =>
                        handleIngChange(idx, "unidad", e.target.value)
                      }
                    >
                      <option value="gr">gr</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="l">l</option>
                      <option value="unid">unid</option>
                    </select>
                    <button
                      onClick={() => handleRemoveIng(idx)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddIng}
                  className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 font-semibold"
                >
                  <PlusCircle size={18} className="mr-2" />
                  Añadir ingrediente
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-4 mt-8">
              <button
                onClick={closeModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg flex items-center shadow-md"
              >
                <Save size={18} className="mr-2" />
                Guardar receta
              </button>
            </div>
          </div>
        </div>
      )}
      <TablaRecetasConInsumos />
    </div>
  );
}
