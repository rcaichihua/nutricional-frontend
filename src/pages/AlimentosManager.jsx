import { useState } from "react";
import { PlusCircle, Edit, Trash2, X, Save } from "lucide-react";

const CAMPOS = [
  { name: "grupo", label: "Grupo", type: "text", required: true },
  { name: "subgrupo", label: "Subgrupo", type: "text" },
  { name: "nombre_alimento", label: "Nombre", type: "text", required: true },
  { name: "peso_neto", label: "Peso Neto (g)", type: "number", step: "0.01" },
  { name: "energia_kcal", label: "Energía (kcal)", type: "number", step: "0.01" },
  { name: "agua_g", label: "Agua (g)", type: "number", step: "0.01" },
  { name: "proteina_animal_g", label: "Proteína Animal (g)", type: "number", step: "0.01" },
  { name: "proteina_vegetal_g", label: "Proteína Vegetal (g)", type: "number", step: "0.01" },
  { name: "nitrogeno_animal_g", label: "Nitrógeno Animal (g)", type: "number", step: "0.01" },
  { name: "nitrogeno_vegetal_g", label: "Nitrógeno Vegetal (g)", type: "number", step: "0.01" },
  { name: "grasa_animal_g", label: "Grasa Animal (g)", type: "number", step: "0.01" },
  { name: "grasa_vegetal_g", label: "Grasa Vegetal (g)", type: "number", step: "0.01" },
  { name: "cho_carbohidrato_g", label: "Carbohidrato (g)", type: "number", step: "0.01" },
  { name: "fibra_g", label: "Fibra Dietaria (g)", type: "number", step: "0.01" },
  { name: "calcio_animal_mg", label: "Calcio Animal (mg)", type: "number", step: "0.01" },
  { name: "calcio_vegetal_mg", label: "Calcio Vegetal (mg)", type: "number", step: "0.01" },
  { name: "fosforo_mg", label: "Fósforo (mg)", type: "number", step: "0.01" },
  { name: "hierro_hem_mg", label: "Hierro Hemo (mg)", type: "number", step: "0.01" },
  { name: "hierro_no_hem_mg", label: "Hierro No Hemo (mg)", type: "number", step: "0.01" },
  { name: "retinol_mcg", label: "Retinol (mcg)", type: "number", step: "0.01" },
  { name: "vitamina_b1_tiamina_mg", label: "Vit. B1 Tiamina (mg)", type: "number", step: "0.01" },
  { name: "vitamina_b2_riboflavina_mg", label: "Vit. B2 Riboflavina (mg)", type: "number", step: "0.01" },
  { name: "niacina_mg", label: "Niacina (mg)", type: "number", step: "0.01" },
  { name: "vitamina_c_mg", label: "Vitamina C (mg)", type: "number", step: "0.01" },
  { name: "sodio_mg", label: "Sodio (mg)", type: "number", step: "0.01" },
  { name: "potasio_mg", label: "Potasio (mg)", type: "number", step: "0.01" },
];

const ESTADOS = ["ACTIVO", "INACTIVO", "ELIMINADO", "OBSERVADO"];

// Demo data inicial (puedes luego traer de tu API)
const DEMO_ALIMENTOS = [
  {
    id: 1, grupo: "Tubérculos", subgrupo: "Papa", nombre_alimento: "Papa blanca",
    peso_neto: 100, energia_kcal: 80, agua_g: 75, proteina_animal_g: 0, proteina_vegetal_g: 2,
    nitrogeno_animal_g: 0, nitrogeno_vegetal_g: 0.3, grasa_animal_g: 0, grasa_vegetal_g: 0,
    cho_carbohidrato_g: 18, fibra_g: 1.5, calcio_animal_mg: 0, calcio_vegetal_mg: 5,
    fosforo_mg: 15, hierro_hem_mg: 0, hierro_no_hem_mg: 0.4, retinol_mcg: 0,
    vitamina_b1_tiamina_mg: 0.1, vitamina_b2_riboflavina_mg: 0.02, niacina_mg: 1.1,
    vitamina_c_mg: 10, sodio_mg: 6, potasio_mg: 300, estado: "ACTIVO"
  },
  // Puedes agregar más datos demo si deseas mostrar varias filas
];

export default function AlimentosManager() {
  const [alimentos, setAlimentos] = useState(DEMO_ALIMENTOS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [filtro, setFiltro] = useState("");

  // --- Abrir modal para crear o editar ---
  const openModal = (alimento = null) => {
    if (alimento) {
      setEditingId(alimento.id);
      setForm(alimento);
    } else {
      setEditingId(null);
      setForm({ estado: "ACTIVO" }); // Por defecto, ACTIVO
    }
    setModalOpen(true);
  };

  // --- Guardar alimento (crear o editar) ---
  const handleSave = () => {
    // Validaciones
    if (!form.nombre_alimento?.trim()) {
      alert("Debes poner el nombre del alimento");
      return;
    }
    if (!form.grupo?.trim()) {
      alert("Selecciona el grupo");
      return;
    }

    if (editingId) {
      // Editar
      setAlimentos(prev =>
        prev.map(a => a.id === editingId ? { ...form, id: editingId } : a)
      );
    } else {
      // Nuevo
      setAlimentos(prev => [
        ...prev,
        { ...form, id: Date.now() }
      ]);
    }
    setModalOpen(false);
  };

  // --- Eliminar alimento ---
  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar alimento?")) {
      setAlimentos(prev => prev.filter(a => a.id !== id));
    }
  };

  // --- Actualizar el form ---
  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "number" ? Number(value) : value
    }));
  };

  // --- Filtro rápido por nombre, grupo o subgrupo ---
  const alimentosFiltrados = alimentos.filter(a =>
    (a.nombre_alimento + a.grupo + (a.subgrupo || ""))
      .toLowerCase()
      .includes(filtro.toLowerCase())
  );

  return (
    <section>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-700 flex items-center">
          <PlusCircle className="mr-2 text-green-600" size={26} /> Mantenimiento de Alimentos
        </h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md hover:shadow-lg transition-all"
          onClick={() => openModal(null)}
        >
          <PlusCircle size={18} className="mr-2" /> Nuevo alimento
        </button>
      </div>
      <input
        type="text"
        className="mb-6 w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-300"
        placeholder="Buscar por nombre, grupo o subgrupo"
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
      />

      {/* Tabla alimentos */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-200">
        <table className="min-w-full text-xs md:text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Nombre</th>
              <th className="p-2">Grupo</th>
              <th className="p-2">Subgrupo</th>
              <th className="p-2">Kcal</th>
              <th className="p-2">Proteína (g)</th>
              <th className="p-2">Carbohidrato (g)</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alimentosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  No hay alimentos registrados.
                </td>
              </tr>
            ) : (
              alimentosFiltrados.map(a => (
                <tr key={a.id} className="border-b hover:bg-green-50 transition">
                  <td className="p-2 font-bold">{a.nombre_alimento}</td>
                  <td className="p-2">{a.grupo}</td>
                  <td className="p-2">{a.subgrupo || "-"}</td>
                  <td className="p-2">{a.energia_kcal ?? 0}</td>
                  <td className="p-2">{(a.proteina_animal_g ?? 0) + (a.proteina_vegetal_g ?? 0)}</td>
                  <td className="p-2">{a.cho_carbohidrato_g ?? 0}</td>
                  <td className="p-2">
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      onClick={() => openModal(a)}
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                      onClick={() => handleDelete(a.id)}
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-2xl relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setModalOpen(false)}
            >
              <X size={28} />
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {editingId ? "Editar alimento" : "Nuevo alimento"}
            </h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                {CAMPOS.map(campo => (
                  <div key={campo.name} className="flex flex-col gap-1">
                    <label className="font-semibold text-gray-600">{campo.label}</label>
                    <input
                      type={campo.type}
                      name={campo.name}
                      step={campo.step}
                      value={form[campo.name] ?? ""}
                      required={campo.required}
                      className="border rounded-lg px-3 py-2"
                      onChange={handleFormChange}
                    />
                  </div>
                ))}
                {/* Estado */}
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-gray-600">Estado</label>
                  <select
                    name="estado"
                    className="border rounded-lg px-3 py-2"
                    value={form.estado}
                    onChange={handleFormChange}
                  >
                    {ESTADOS.map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg flex items-center shadow-md"
                >
                  <Save size={18} className="mr-2" />
                  Guardar alimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
