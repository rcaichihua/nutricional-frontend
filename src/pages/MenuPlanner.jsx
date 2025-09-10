import { useState, useEffect, useMemo, useCallback } from "react";
// 1. Se añaden los nuevos íconos y funciones
import { User2, PlusCircle, Trash2, ChevronLeft, ChevronRight, CalendarClock } from "lucide-react"; 
import { format, getWeek, isSameWeek } from 'date-fns'; 
import { es } from 'date-fns/locale';
import { useRecetas } from "../hooks/useRecetas";
import { getMenus, crearMenu, editarMenu } from "../api/menus";
import SelectRecipeModal from "../components/SelectRecipeModal";
import SelectMenuModal from "../components/SelectMenuModal";
import { useAsignacionMenu } from "../hooks/useAsignacionMenu";

// Mover constantes fuera del componente
const DIAS_SEMANA = [
  "Lunes", "Martes", "Miércoles", "Jueves", 
  "Viernes", "Sábado", "Domingo"
];

const COMIDAS = [
  { tipo: "Desayuno", color: "text-blue-700" },
  { tipo: "Almuerzo", color: "text-blue-700" },
  { tipo: "Cena", color: "text-blue-700" },
];

export default function MenuPlanner() {
  const { asignacionMenu, createAsignacionMenu, deleteAsignacionMenu } = useAsignacionMenu();
  const { recetasConInsumos } = useRecetas({ onlyConInsumos: true });

  const [menusPorDiaComida, setMenusPorDiaComida] = useState({});

  useEffect(() => {
    const agrupados = {};
    asignacionMenu.forEach((asig) => {
      const fecha = asig.fechaAsignacion;
      const tipo = asig.tipoComida;
      if (!agrupados[fecha]) agrupados[fecha] = {};
      if (!agrupados[fecha][tipo]) agrupados[fecha][tipo] = [];
      agrupados[fecha][tipo].push(asig);
    });
    setMenusPorDiaComida(agrupados);
  }, [asignacionMenu]);

  const handleEliminarAsignacion = useCallback(async (asignacionMenuId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este menú asignado?")) {
      const success = await deleteAsignacionMenu(asignacionMenuId);
      
      if (!success) {
        alert("Hubo un error al eliminar la asignación.");
      }
    }
  }, [deleteAsignacionMenu]);

  const [semanaSeleccionada, setSemanaSeleccionada] = useState(() => {
    const hoy = new Date();
    const lunes = new Date(hoy);
    const diaSemana = hoy.getDay();
    const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    lunes.setDate(hoy.getDate() - diasHastaLunes);
    return lunes;
  });

  // --- 2. NUEVA FUNCIÓN PARA VOLVER A LA SEMANA ACTUAL ---
  const handleGoToCurrentWeek = () => {
    // Simplemente resetea el estado al cálculo inicial
    const hoy = new Date();
    const lunes = new Date(hoy);
    const diaSemana = hoy.getDay();
    const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    lunes.setDate(hoy.getDate() - diasHastaLunes);
    setSemanaSeleccionada(lunes);
  };
  
  // El resto de tu código original se mantiene intacto...
  const [comensales, setComensales] = useState(
    DIAS_SEMANA.reduce((acc, dia) => ({ ...acc, [dia]: 700 }), {})
  );

  const [seleccionadas, setSeleccionadas] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({ dia: "", comida: "" });

  const [guardando, setGuardando] = useState({});

  const [menus, setMenus] = useState([]);
  const [cargandoMenus, setCargandoMenus] = useState(true);
  const [mostrarLoader, setMostrarLoader] = useState(false);

  const refetchMenusYAsignaciones = useCallback(async () => {
    setCargandoMenus(true);
    try {
      const menusObtenidos = await getMenus();
      setMenus(menusObtenidos);
      if (typeof asignacionMenu.fetchAsignacionMenus === 'function') {
        await asignacionMenu.fetchAsignacionMenus();
      }
    } catch (error) {
      console.log("Error al refrescar menús/asignaciones:", error);
    } finally {
      setCargandoMenus(false);
    }
  }, [asignacionMenu]);

  useEffect(() => {
    let timer;
    if (cargandoMenus) {
      timer = setTimeout(() => setMostrarLoader(true), 300);
    } else {
      setMostrarLoader(false);
    }
    return () => clearTimeout(timer);
  }, [cargandoMenus]);

  useEffect(() => {
    refetchMenusYAsignaciones();
  }, [refetchMenusYAsignaciones]);

  const obtenerFechasSemana = (fechaInicio) => {
    const fechas = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fechaInicio.getDate() + i);
      fechas.push(fecha);
    }
    return fechas;
  };

  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const formatearFechaISO = useCallback((fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const fechasSemana = useMemo(() => 
    obtenerFechasSemana(semanaSeleccionada), 
    [semanaSeleccionada]
  );
    
  const formattedWeekTitle = useMemo(() => {
    const weekStart = fechasSemana[0];
    const weekEnd = fechasSemana[6];
    const weekNumber = getWeek(weekStart, { weekStartsOn: 1, locale: es });
    return `Semana ${weekNumber}: ${format(weekStart, 'd MMM', { locale: es })} - ${format(weekEnd, 'd MMM, yyyy', { locale: es })}`;
  }, [fechasSemana]);

  // --- 3. NUEVA LÓGICA PARA SABER SI ESTAMOS EN LA SEMANA ACTUAL ---
  const isCurrentWeek = useMemo(() => 
    isSameWeek(semanaSeleccionada, new Date(), { weekStartsOn: 1 }),
    [semanaSeleccionada]
  );
  
  // El resto de tu código original se mantiene intacto...
  const semanaAnterior = () => {
    const nuevaSemana = new Date(semanaSeleccionada);
    nuevaSemana.setDate(semanaSeleccionada.getDate() - 7);
    setSemanaSeleccionada(nuevaSemana);
  };

  const semanaSiguiente = () => {
    const nuevaSemana = new Date(semanaSeleccionada);
    nuevaSemana.setDate(semanaSeleccionada.getDate() + 7);
    setSemanaSeleccionada(nuevaSemana);
  };
  
  const handleAbrirModal = useCallback((dia, tipoComida) => {
    setModalInfo({ dia, comida: tipoComida });
    setModalOpen(true);
  }, []);
  
  return (
    <section>
      {/* --- 4. SELECTOR DE SEMANA MODIFICADO --- */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={semanaAnterior}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex items-center gap-4">
            {/* El botón "Hoy" solo aparece si no estamos en la semana actual */}
            {!isCurrentWeek && (
              <button 
                onClick={handleGoToCurrentWeek}
                className="px-3 py-1 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors text-sm flex items-center gap-2"
              >
                <CalendarClock size={16} />
                Hoy
              </button>
            )}
            <h2 className="text-xl font-bold text-gray-800 text-center min-w-[300px]">
              {formattedWeekTitle}
            </h2>
          </div>
          
          <button
            onClick={semanaSiguiente}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
      
      {/* El resto de tu componente se mantiene exactamente igual */}
      <div className="relative">
        {mostrarLoader && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-70 z-10">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Cargando menús...</p>
          </div>
        )}
        <div className={mostrarLoader ? "pointer-events-none opacity-50" : ""}>
          <div className="space-y-8">
            {DIAS_SEMANA.map((dia, index) => {
              const fechaISO = formatearFechaISO(fechasSemana[index]);
              const asignadosPorComida = menusPorDiaComida[fechaISO] || {};
              return (
                <div key={dia} className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-extrabold">{dia}</span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{formatearFecha(fechasSemana[index])}</span>
                      {Object.values(asignadosPorComida).flat().length > 0 ? (<span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium">Con menú asignado</span>) : (<span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg font-medium">Sin menú</span>)}
                    </div>
                    <div className="flex items-center gap-2">
                      <User2 className="text-gray-500" />
                      <span className="text-gray-600 font-medium">Comensales:</span>
                      <input type="number" min={1} value={comensales[dia]} onChange={(e) => setComensales((prev) => ({...prev, [dia]: Number(e.target.value)}))} className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-300 font-bold" />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    {COMIDAS.map(({ tipo, color }) => (
                      <div key={tipo} className="flex-1 flex flex-col gap-2">
                        <span className={`font-semibold ${color}`}>{tipo}</span>
                        <div className="space-y-2">
                          {(asignadosPorComida[tipo] || []).map((asignacion) => (
                            <div key={asignacion.asignacionMenuId} className="w-full border-2 border-blue-200 rounded-xl py-3 px-4 flex items-center justify-between bg-blue-50 group">
                              <span className="font-bold text-blue-700">{asignacion.menu.nombreMenu}</span>
                              <button onClick={() => handleEliminarAsignacion(asignacion.asignacionMenuId)} className="opacity-0 group-hover:opacity-100 transition-opacity" title="Eliminar asignación de menú">
                                <Trash2 className="text-red-500 hover:text-red-700" size={20} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button className="mt-2 w-full border-2 border-dashed border-gray-300 rounded-xl py-3 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 transition" onClick={() => handleAbrirModal(dia, tipo)}>
                          <PlusCircle /> Asignar menu
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {modalOpen && (
        <SelectMenuModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          fechaSeleccionada={(() => {
            if (!modalOpen) return "";
            const idx = DIAS_SEMANA.indexOf(modalInfo.dia);
            return idx >= 0 ? formatearFechaISO(fechasSemana[idx]) : "";
          })()}
          menus={menus}
          seleccionados={(() => {
            if (!modalOpen) return [];
            const idx = DIAS_SEMANA.indexOf(modalInfo.dia);
            const fechaISO = idx >= 0 ? formatearFechaISO(fechasSemana[idx]) : "";
            return menusPorDiaComida[fechaISO]?.[modalInfo.comida] || [];
          })()}
          onSave={async (seleccionados) => {
            const idx = DIAS_SEMANA.indexOf(modalInfo.dia);
            const fechaAsignacion = idx >= 0 ? formatearFechaISO(fechasSemana[idx]) : "";
            const tipoComida = modalInfo.comida;
            const menuIds = seleccionados.map(m => m.menuId);
            const dto = { fechaAsignacion, tipoComida, menuIds };
            const ok = await createAsignacionMenu(dto, () => {
              alert("Asignación guardada exitosamente");
            });
            if (!ok) {
              alert("Error al guardar la asignación");
            }
          }}
        />
      )}
    </section>
  );
};