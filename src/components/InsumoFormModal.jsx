import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";

export default function InsumoFormModal({ insumo, onSave, onClose }) {
  const [form, setForm] = useState(insumo || { estado: "ACTIVO" });

  useEffect(() => {
    setForm(insumo || { estado: "ACTIVO" });
  }, [insumo]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "number" ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-2xl relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          <X size={28} />
        </button>
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          {insumo ? "Editar insumo" : "Nuevo insumo"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            {/* Campo: Grupo */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Grupo</label>
              <input
                type="text"
                name="grupo"
                value={form.grupo ?? ""}
                required
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Subgrupo */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Subgrupo</label>
              <input
                type="text"
                name="subgrupo"
                value={form.subgrupo ?? ""}
                required
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Nombre del insumo */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre ?? ""}
                required
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Peso Neto */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Peso Neto (g)</label>
              <input
                type="number"
                name="pesoNeto"
                step="0.01"
                value={form.pesoNeto ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Energía Kcal */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Energía (kcal)</label>
              <input
                type="number"
                name="energiaKcal"
                step="0.01"
                value={form.energiaKcal ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Agua (g) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Agua (g)</label>
              <input
                type="number"
                name="aguaG"
                step="0.01"
                value={form.aguaG ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Proteína Animal (g) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Proteína Animal (g)</label>
              <input
                type="number"
                name="proteinaAnimalG"
                step="0.01"
                value={form.proteinaAnimalG ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Proteína Vegetal (g) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Proteína Vegetal (g)</label>
              <input
                type="number"
                name="proteinaVegetalG"
                step="0.01"
                value={form.proteinaVegetalG ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Nitrógeno Animal (g) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Nitrógeno Animal (g)</label>
              <input
                type="number"
                name="nitrogenoAnimalG"
                step="0.01"
                value={form.nitrogenoAnimalG ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Nitrógeno Vegetal (g) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Nitrógeno Vegetal (g)</label>
              <input
                type="number"
                name="nitrogenoVegetalG"
                step="0.01"
                value={form.nitrogenoVegetalG ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Grasa Animal (g) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Grasa Animal (g)</label>
              <input
                type="number"
                name="grasaAnimalG"
                step="0.01"
                value={form.grasaAnimalG ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Grasa Vegetal (g) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Grasa Vegetal (g)</label>
              <input
                type="number"
                name="grasaVegetalG"
                step="0.01"
                value={form.grasaVegetalG ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Carbohidrato (g) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Carbohidrato (g)</label>
              <input
                type="number"
                name="choCarbohidratoG"
                step="0.01"
                value={form.choCarbohidratoG ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Fibra Dietaria (g) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Fibra Dietaria (g)</label>
              <input
                type="number"
                name="fibraG"
                step="0.01"
                value={form.fibraG ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Calcio Animal (mg) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Calcio Animal (mg)</label>
              <input
                type="number"
                name="calcioAnimalMg"
                step="0.01"
                value={form.calcioAnimalMg ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Calcio Vegetal (mg) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Calcio Vegetal (mg)</label>
              <input
                type="number"
                name="calcioVegetalMg"
                step="0.01"
                value={form.calcioVegetalMg ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Fósforo (mg) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Fósforo (mg)</label>
              <input
                type="number"
                name="fosforoMg"
                step="0.01"
                value={form.fosforoMg ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Hierro Hemo (mg) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Hierro Hemo (mg)</label>
              <input
                type="number"
                name="hierroHemMg"
                step="0.01"
                value={form.hierroHemMg ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Hierro No Hemo (mg) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Hierro No Hemo (mg)</label>
              <input
                type="number"
                name="hierroNoHemMg"
                step="0.01"
                value={form.hierroNoHemMg ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Retinol (mcg) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Retinol (mcg)</label>
              <input
                type="number"
                name="retinolMcg"
                step="0.01"
                value={form.retinolMcg ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Vitamina B1 Tiamina (mg) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Vit. B1 Tiamina (mg)</label>
              <input
                type="number"
                name="vitaminaB1TiaminaMg"
                step="0.01"
                value={form.vitaminaB1TiaminaMg ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Vitamina B2 Riboflavina (mg) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Vit. B2 Riboflavina (mg)</label>
              <input
                type="number"
                name="vitaminaB2RiboflavinaMg"
                step="0.01"
                value={form.vitaminaB2RiboflavinaMg ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Niacina (mg) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Niacina (mg)</label>
              <input
                type="number"
                name="niacinaMg"
                step="0.01"
                value={form.niacinaMg ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Vitamina C (mg) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Vitamina C (mg)</label>
              <input
                type="number"
                name="vitaminaCMg"
                step="0.01"
                value={form.vitaminaCMg ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Sodio (mg) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Sodio (mg)</label>
              <input
                type="number"
                name="sodioMg"
                step="0.01"
                value={form.sodioMg ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>
            {/* Campo: Potasio (mg) */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Potasio (mg)</label>
              <input
                type="number"
                name="potasioMg"
                step="0.01"
                value={form.potasioMg ?? ""}
                className="border rounded-lg px-3 py-2"
                onChange={handleChange}
              />
            </div>            
            {/* Campo: Estado */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-600">Estado</label>
              <select
                name="estado"
                className="border rounded-lg px-3 py-2"
                value={form.estado ?? "ACTIVO"}
                onChange={handleChange}
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
                <option value="ELIMINADO">ELIMINADO</option>
                <option value="OBSERVADO">OBSERVADO</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg flex items-center shadow-md"
            >
              <Save size={18} className="mr-2" />
              Guardar insumo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
