import { useState } from "react";
import { User2, PlusCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useRecetas } from "../hooks/useRecetas";
import SelectRecipeModal from "./SelectRecipeModal";

const diasSemana = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
const comidas = [
  { tipo: "Desayuno", color: "text-blue-700" },
  // { tipo: "Media mañana", color: "text-blue-700" },
  { tipo: "Almuerzo", color: "text-blue-700" },
  // { tipo: "Media tarde", color: "text-blue-700" },
  { tipo: "Cena", color: "text-blue-700" },
];

export default function MenuPlanner() {
  const { recetasConInsumos } = useRecetas();
  
  // Estado para la semana seleccionada
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(() => {
    const hoy = new Date();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes de esta semana
    return lunes;
  });

  const [comensales, setComensales] = useState(
    diasSemana.reduce((acc, dia) => ({ ...acc, [dia]: 700 }), {})
  );

  // Ahora cada comida es un arreglo de recetasConInsumos
  const [seleccionadas, setSeleccionadas] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({ dia: "", comida: "" });

  // Función para obtener las fechas de la semana
  const obtenerFechasSemana = (fechaInicio) => {
    const fechas = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fechaInicio.getDate() + i);
      fechas.push(fecha);
    }
    return fechas;
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  // Navegar a la semana anterior
  const semanaAnterior = () => {
    const nuevaSemana = new Date(semanaSeleccionada);
    nuevaSemana.setDate(semanaSeleccionada.getDate() - 7);
    setSemanaSeleccionada(nuevaSemana);
  };

  // Navegar a la semana siguiente
  const semanaSiguiente = () => {
    const nuevaSemana = new Date(semanaSeleccionada);
    nuevaSemana.setDate(semanaSeleccionada.getDate() + 7);
    setSemanaSeleccionada(nuevaSemana);
  };

  // Obtener fechas de la semana actual
  const fechasSemana = obtenerFechasSemana(semanaSeleccionada);

  // Estado para el guardado
  const [guardando, setGuardando] = useState({});

  // Función para guardar un día específico
  const handleGuardarDia = async (dia) => {
    setGuardando(prev => ({ ...prev, [dia]: true }));
    
    try {
      // Aquí iría la lógica para guardar en el backend
      const datosDia = {
        dia: dia,
        fecha: formatearFecha(fechasSemana[diasSemana.indexOf(dia)]),
        semana: formatearFecha(semanaSeleccionada),
        comensales: comensales[dia],
        recetas: seleccionadas[dia] || {}
      };
      
      console.log('Guardando día:', datosDia);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`¡Menú del ${dia} guardado exitosamente!`);
      
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el menú');
    } finally {
      setGuardando(prev => ({ ...prev, [dia]: false }));
    }
  };

  // Función para verificar si un día tiene recetas
  const tieneRecetas = (dia) => {
    const recetasDia = seleccionadas[dia];
    if (!recetasDia) return false;
    
    return Object.values(recetasDia).some(recetas => recetas && recetas.length > 0);
  };

  // Abre el modal para el día y comida seleccionada
  const handleAbrirModal = (dia, comida) => {
    setModalInfo({ dia, comida });
    setModalOpen(true);
  };

  // Agrega receta (pueden repetirse, pero puedes filtrar si quieres)
  const handleSeleccionarReceta = (receta) => {
    setSeleccionadas((prev) => {
      const recetasPorComida = prev[modalInfo.dia]?.[modalInfo.comida] || [];
      // Validar si ya existe esa receta para este día y comida
      if (recetasPorComida.some((r) => r.recetaId === receta.recetaId)) {
        alert("¡Esta receta ya está asignada para este día y comida!");
        return prev; // No agregar duplicado
      }
      return {
        ...prev,
        [modalInfo.dia]: {
          ...(prev[modalInfo.dia] || {}),
          [modalInfo.comida]: [...recetasPorComida, receta],
        },
      };
    });
    setModalOpen(false);
  };

  // Elimina una receta puntual
  const handleEliminarReceta = (dia, comida, recetaIdx) => {
    setSeleccionadas((prev) => {
      const nuevas = [...(prev[dia]?.[comida] || [])];
      nuevas.splice(recetaIdx, 1);
      return {
        ...prev,
        [dia]: {
          ...(prev[dia] || {}),
          [comida]: nuevas,
        },
      };
    });
  };

  return (
    <section>
      {/* Selector de semana */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={semanaAnterior}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800">
              Semana del {formatearFecha(semanaSeleccionada)}
            </h3>
            <p className="text-sm text-gray-500">
              {formatearFecha(fechasSemana[0])} - {formatearFecha(fechasSemana[6])}
            </p>
          </div>
          
          <button
            onClick={semanaSiguiente}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {diasSemana.map((dia, index) => (
          <div
            key={dia}
            className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4"
          >
            <div className="flex flex-wrap items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xl font-extrabold">{dia}</span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                  {formatearFecha(fechasSemana[index])}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User2 className="text-gray-500" />
                <span className="text-gray-600 font-medium">Comensales:</span>
                <input
                  type="number"
                  min={1}
                  value={comensales[dia]}
                  onChange={(e) =>
                    setComensales((prev) => ({
                      ...prev,
                      [dia]: Number(e.target.value),
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
                  {/* Lista de recetasConInsumos para esta comida */}
                  <div className="space-y-2">
                    {(seleccionadas[dia]?.[tipo] || []).map((receta, idx) => (
                      <div
                        key={idx}
                        className="w-full border-2 border-blue-200 rounded-xl py-3 px-4 flex items-center justify-between bg-blue-50"
                      >
                        <span className="font-bold text-blue-700">
                          {receta.nombre}
                        </span>
                        <button
                          onClick={() => handleEliminarReceta(dia, tipo, idx)}
                          className="text-red-400 hover:text-red-700 p-1"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {/* Botón para agregar más recetasConInsumos */}
                  <button
                    className="mt-2 w-full border-2 border-dashed border-gray-300 rounded-xl py-3 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 transition"
                    onClick={() => handleAbrirModal(dia, tipo)}
                  >
                    <PlusCircle /> Agregar receta
                  </button>
                </div>
              ))}
            </div>
            {/* Botón de guardar */}
            <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleGuardarDia(dia)}
                disabled={!tieneRecetas(dia) || guardando[dia]}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  tieneRecetas(dia)
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {guardando[dia] ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar {dia}
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Modal */}
      <SelectRecipeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        recetas={recetasConInsumos}
        dia={modalInfo.dia}
        comida={modalInfo.comida}
        onSelect={handleSeleccionarReceta}
        seleccionadas={seleccionadas} // <--- aquí
      />
    </section>
  );
}
