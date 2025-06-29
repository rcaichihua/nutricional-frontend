import { useState } from "react";
import { User2, PlusCircle, X } from "lucide-react";
import SelectRecipeModal from "./SelectRecipeModal";

const recetasEjemplo = [
  { id: 1, nombre: "Sopa de verduras", ingredientes: [] },
  { id: 2, nombre: "Lentejas con arroz", ingredientes: [] },
  { id: 3, nombre: "Pollo al horno", ingredientes: [] },
  { id: 4, nombre: "Ensalada fresca", ingredientes: [] },
  { id: 5, nombre: "Gelatina de postre", ingredientes: [] },
];

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const comidas = [
  { tipo: "Desayuno", color: "text-blue-700" },
  { tipo: "Almuerzo", color: "text-blue-700" },
  { tipo: "Cena", color: "text-blue-700" }
];

export default function MenuPlanner() {
  const [comensales, setComensales] = useState(
  diasSemana.reduce((acc, dia) => ({ ...acc, [dia]: 700 }), {})
);

  // Ahora cada comida es un arreglo de recetas
  const [seleccionadas, setSeleccionadas] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({ dia: "", comida: "" });

  const recetas = recetasEjemplo;

  // Abre el modal para el día y comida seleccionada
  const handleAbrirModal = (dia, comida) => {
    setModalInfo({ dia, comida });
    setModalOpen(true);
  };

  // Agrega receta (pueden repetirse, pero puedes filtrar si quieres)
  const handleSeleccionarReceta = (receta) => {
  setSeleccionadas(prev => {
    const recetasPorComida = (prev[modalInfo.dia]?.[modalInfo.comida] || []);
    // Validar si ya existe esa receta para este día y comida
    if (recetasPorComida.some(r => r.id === receta.id)) {
      alert("¡Esta receta ya está asignada para este día y comida!");
      return prev; // No agregar duplicado
    }
    return {
      ...prev,
      [modalInfo.dia]: {
        ...(prev[modalInfo.dia] || {}),
        [modalInfo.comida]: [...recetasPorComida, receta],
      }
    };
  });
  setModalOpen(false);
};

  // Elimina una receta puntual
  const handleEliminarReceta = (dia, comida, recetaIdx) => {
    setSeleccionadas(prev => {
      const nuevas = [...(prev[dia]?.[comida] || [])];
      nuevas.splice(recetaIdx, 1);
      return {
        ...prev,
        [dia]: {
          ...(prev[dia] || {}),
          [comida]: nuevas,
        }
      };
    });
  };

  return (
    <section>
      <div className="space-y-8">
        {diasSemana.map((dia) => (
          <div key={dia} className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between mb-2">
              <span className="text-xl font-extrabold">{dia}</span>
              <div className="flex items-center gap-2">
                <User2 className="text-gray-500" />
                <span className="text-gray-600 font-medium">Comensales:</span>
                <input
                    type="number"
                    min={1}
                    value={comensales[dia]}
                    onChange={e =>
                    setComensales(prev => ({
                        ...prev,
                        [dia]: Number(e.target.value)
                    }))
                    }
                    className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-300 font-bold"
                />
              </div>
            </div>
            {/* Comidas */}
            <div className="flex flex-col md:flex-row gap-4">
              {comidas.map(({ tipo, color }) => (
                <div key={tipo} className="flex-1 flex flex-col gap-2">
                  <span className={`font-semibold ${color}`}>{tipo}</span>
                  {/* Lista de recetas para esta comida */}
                  <div className="space-y-2">
                    {(seleccionadas[dia]?.[tipo] || []).map((receta, idx) => (
                      <div key={idx} className="w-full border-2 border-blue-200 rounded-xl py-3 px-4 flex items-center justify-between bg-blue-50">
                        <span className="font-bold text-blue-700">{receta.nombre}</span>
                        <button
                          onClick={() => handleEliminarReceta(dia, tipo, idx)}
                          className="text-red-400 hover:text-red-700 p-1"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {/* Botón para agregar más recetas */}
                  <button
                    className="mt-2 w-full border-2 border-dashed border-gray-300 rounded-xl py-3 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 transition"
                    onClick={() => handleAbrirModal(dia, tipo)}
                  >
                    <PlusCircle /> Agregar receta
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Modal */}
      <SelectRecipeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        recetas={recetas}
        dia={modalInfo.dia}
        comida={modalInfo.comida}
        onSelect={handleSeleccionarReceta}
        seleccionadas={seleccionadas} // <--- aquí
      />
    </section>
  );
}
