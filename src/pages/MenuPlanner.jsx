import SucursalSelect from "../components/SucursalSelect";
import { useSucursales } from "../hooks/useSucursales";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  User2,
  PlusCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
  BarChart3,
  Save,
  Loader2,
  StickyNote,
} from "lucide-react";
import { format, getWeek, isSameWeek, parseISO } from "date-fns";
import { es } from "date-fns/locale";
// CORRECCIÓN 1: Quitamos 'crearAsignacionMenu' de aquí porque usaremos la del hook
import { getMenus, getReporteNutricionalDia, guardarObservacion, getObservacionesRango } from "../api/menus";
import SelectMenuModal from "../components/SelectMenuModal";
import { useAsignacionMenu } from "../hooks/useAsignacionMenu";
import ReporteNutricionalDiaModal from "../components/ReporteNutricionalDiaModal";
import ObservacionModal from "../components/ObservacionModal";

const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const COMIDAS = [
  { tipo: "Desayuno", color: "text-blue-700" },
  { tipo: "Almuerzo", color: "text-blue-700" },
  { tipo: "Cena", color: "text-blue-700" },
];

// Helper para crear el estado por defecto de los comensales
const defaultComensales = () =>
  DIAS_SEMANA.reduce((acc, dia) => ({ ...acc, [dia]: 0 }), {});

export default function MenuPlanner() {
  const { selectedId: sucursalId, selected } = useSucursales();
  const {
    asignacionMenu,
    // CORRECCIÓN 2: Descomentamos esta línea para usar la función del hook
    createAsignacionMenu, 
    deleteAsignacionMenu,
    fetchAsignacionMenus,
    loading: loadingAsignaciones,
  } = useAsignacionMenu();

  const [menusPorDiaComida, setMenusPorDiaComida] = useState({});

  const [semanaSeleccionada, setSemanaSeleccionada] = useState(() => {
    const hoy = new Date();
    const lunes = new Date(hoy);
    const diaSemana = hoy.getDay();
    const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    lunes.setDate(hoy.getDate() - diasHastaLunes);
    return lunes;
  });

  const [comensales, setComensales] = useState(defaultComensales);
  
  // Estado para las observaciones
  const [observaciones, setObservaciones] = useState({}); 
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({ dia: "", comida: "" });
  const [menus, setMenus] = useState([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [mostrarLoader, setMostrarLoader] = useState(false);
  const isLoading = cargandoCatalogo || loadingAsignaciones;

  const [reporteModalOpen, setReporteModalOpen] = useState(false);
  const [reporteData, setReporteData] = useState(null);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [errorReporte, setErrorReporte] = useState(null);
  const [reporteInfo, setReporteInfo] = useState({ fecha: "", comensales: 0, sucursalNombre: "" });

  // Estado para el modal de observación
  const [obsModalOpen, setObsModalOpen] = useState(false);
  const [obsModalInfo, setObsModalInfo] = useState({ fechaISO: "", fechaLegible: "", texto: "" });

  const [savingComensales, setSavingComensales] = useState(null);

  // --- Funciones de Fechas ---
  const obtenerFechasSemana = (fechaInicio) => {
    const fechas = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fechaInicio.getDate() + i);
      fechas.push(fecha);
    }
    return fechas;
  };

  const formatearFecha = (fecha) =>
    fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });

  const formatearFechaISO = useCallback(
    (fecha) => format(fecha, "yyyy-MM-dd"),
    []
  );

  const fechasSemana = useMemo(
    () => obtenerFechasSemana(semanaSeleccionada),
    [semanaSeleccionada]
  );

  const fechasSemanaSet = useMemo(
    () => new Set(fechasSemana.map((f) => formatearFechaISO(f))),
    [fechasSemana, formatearFechaISO]
  );

  // --- EFECTOS ---

  // 1. Cargar catálogo
  useEffect(() => {
    let active = true;
    setCargandoCatalogo(true);
    getMenus()
      .then(m => { if (active) setMenus(m); })
      .catch(console.error)
      .finally(() => { if (active) setCargandoCatalogo(false); });
    return () => { active = false; };
  }, []);

  // 2. Cargar datos al cambiar sucursal o semana
  useEffect(() => {
    setMenusPorDiaComida({});
    setComensales(defaultComensales());
    setObservaciones({}); // Limpiar observaciones al cambiar

    if (sucursalId) {
      fetchAsignacionMenus({ sucursalId });
      
      // Cargar observaciones de la semana actual
      const fechaInicio = formatearFechaISO(fechasSemana[0]);
      const fechaFin = formatearFechaISO(fechasSemana[6]);
      
      getObservacionesRango(fechaInicio, fechaFin, { sucursalId })
        .then(data => {
          const obsMap = {};
          if (Array.isArray(data)) {
            data.forEach(o => obsMap[o.fecha] = o.observacion);
          }
          setObservaciones(obsMap);
        })
        .catch(console.error);
    }
  }, [sucursalId, fetchAsignacionMenus, fechasSemana, formatearFechaISO]);

  // 3. Procesar asignaciones
  useEffect(() => {
    const agrupados = {};
    const comensalesDeLaSemana = defaultComensales(); // 1. Inicia reseteado
    const fechaIsoToDia = new Map(
      fechasSemana.map((f, idx) => [formatearFechaISO(f), DIAS_SEMANA[idx]])
    );

    (asignacionMenu || [])
      .filter((a) => fechasSemanaSet.has(a.fechaAsignacion))
      .forEach((asig) => {
        const fecha = asig.fechaAsignacion;
        const tipo = asig.tipoComida;

        if (!agrupados[fecha]) agrupados[fecha] = {};
        if (!agrupados[fecha][tipo]) agrupados[fecha][tipo] = [];
        agrupados[fecha][tipo].push(asig);

        const dia = fechaIsoToDia.get(asig.fechaAsignacion); 
        if (dia) {
          if (asig.tipoComida === "Almuerzo") {
            comensalesDeLaSemana[dia] = asig.comensales ?? 0;
          } else if (comensalesDeLaSemana[dia] === 0) {
            comensalesDeLaSemana[dia] = asig.comensales ?? 0;
          }
        }
      });
    
    setMenusPorDiaComida(agrupados);
    setComensales(comensalesDeLaSemana);

  }, [asignacionMenu, fechasSemana, fechasSemanaSet, formatearFechaISO]);

  useEffect(() => {
    let t;
    if (isLoading) {
      t = setTimeout(() => setMostrarLoader(true), 300);
    } else {
      setMostrarLoader(false);
    }
    return () => clearTimeout(t);
  }, [isLoading]);

  // --- Handlers ---

  const handleGoToCurrentWeek = () => {
    const hoy = new Date();
    const lunes = new Date(hoy);
    const diaSemana = hoy.getDay();
    const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    lunes.setDate(hoy.getDate() - diasHastaLunes);
    setSemanaSeleccionada(lunes);
  };

  const formattedWeekTitle = useMemo(() => {
    const weekStart = fechasSemana[0];
    const weekEnd = fechasSemana[6];
    const weekNumber = getWeek(weekStart, { weekStartsOn: 1, locale: es });
    return `Semana ${weekNumber}: ${format(weekStart, "d MMM", { locale: es })} - ${format(
      weekEnd,
      "d MMM, yyyy",
      { locale: es }
    )}`;
  }, [fechasSemana]);

  const isCurrentWeek = useMemo(
    () => isSameWeek(semanaSeleccionada, new Date(), { weekStartsOn: 1 }),
    [semanaSeleccionada]
  );

  const semanaAnterior = () => {
    const nueva = new Date(semanaSeleccionada);
    nueva.setDate(semanaSeleccionada.getDate() - 7);
    setSemanaSeleccionada(nueva);
  };

  const semanaSiguiente = () => {
    const nueva = new Date(semanaSeleccionada);
    nueva.setDate(semanaSeleccionada.getDate() + 7);
    setSemanaSeleccionada(nueva);
  };

  const handleAbrirModal = useCallback((dia, tipoComida) => {
    setModalInfo({ dia, comida: tipoComida });
    setModalOpen(true);
  }, []);

  const handleEliminarAsignacion = useCallback(
    async (asignacionMenuId) => {
      if (window.confirm("¿Estás seguro de que deseas eliminar este menú asignado?")) {
        const success = await deleteAsignacionMenu(asignacionMenuId, { sucursalId });
        if (!success) alert("Hubo un error al eliminar la asignación.");
      }
    },
    [deleteAsignacionMenu, sucursalId]
  );

  const handleVerReporteDia = useCallback(async (dia, fechaISO, numComensales) => {
    if (!sucursalId) return;
    
    setReporteInfo({ 
      fecha: format(parseISO(fechaISO), "dd 'de' MMMM, yyyy", { locale: es }), 
      comensales: numComensales,
      sucursalNombre: selected?.nombre || "N/A"
    });
    setLoadingReporte(true);
    setErrorReporte(null);
    setReporteData(null);
    setReporteModalOpen(true);

    try {
      const data = await getReporteNutricionalDia(fechaISO, sucursalId, numComensales);
      setReporteData(data);
    } catch (e) {
      if (e.code === 'HTTP_404') {
        setErrorReporte("No se encontraron menús asignados para este día.");
      } else {
        setErrorReporte("Error al calcular el reporte. Intente más tarde.");
      }
      console.error("Error al cargar reporte:", e);
    } finally {
      setLoadingReporte(false);
    }
  }, [sucursalId, selected]);

  const handleSaveComensales = useCallback(async (dia, fechaISO) => {
    if (!sucursalId) {
        alert("Por favor, seleccione un comedor.");
        return;
    }
    
    const asignadosAlmuerzo = menusPorDiaComida[fechaISO]?.['Almuerzo'] || [];
    if (asignadosAlmuerzo.length === 0) {
        alert("Debe asignar al menos un menú de almuerzo para guardar la cantidad de usuarios.");
        return;
    }

    setSavingComensales(dia);

    try {
        const numComensales = comensales[dia] ?? 0;
        const menuIds = asignadosAlmuerzo.map(asig => asig.menu?.menuId).filter(Boolean);

        const dto = {
            fechaAsignacion: fechaISO,
            tipoComida: 'Almuerzo',
            menuIds: menuIds,
            comensales: numComensales,
        };

        // CORRECCIÓN 3: Ahora 'createAsignacionMenu' existe porque lo extrajimos del hook
        const ok = await createAsignacionMenu(
            dto,
            () => alert("Cantidad de usuarios guardada exitosamente."), 
            { sucursalId }
        );

        if (!ok) {
            alert("Error al guardar la cantidad de usuarios.");
        }
    } catch (e) {
        console.error("Error en handleSaveComensales:", e);
        alert("Ocurrió un error inesperado al guardar.");
    } finally {
        setSavingComensales(null);
    }
  }, [sucursalId, comensales, menusPorDiaComida, createAsignacionMenu]); 

  // --- Funciones para Observaciones ---
  
  const handleAbrirObservacion = (fechaISO) => {
    setObsModalInfo({
        fechaISO,
        fechaLegible: format(parseISO(fechaISO), "dd 'de' MMMM", { locale: es }),
        texto: observaciones[fechaISO] || ""
    });
    setObsModalOpen(true);
  };

  const handleGuardarObservacion = async (texto) => {
    if (!sucursalId) return;
    try {
        await guardarObservacion({
            fecha: obsModalInfo.fechaISO,
            observacion: texto
        }, { sucursalId });
        
        setObservaciones(prev => ({ ...prev, [obsModalInfo.fechaISO]: texto }));
    } catch (e) {
        console.error("Error al guardar observación:", e);
        alert("Error al guardar la observación");
    }
  };

  return (
    <section key={sucursalId ?? 'no-sucursal'}>
      {/* ... (Header y resto del renderizado igual) ... */}
      <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={semanaAnterior}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Semana anterior"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="flex items-center gap-2">
              {!isCurrentWeek && (
                <button
                  onClick={handleGoToCurrentWeek}
                  className="px-3 py-1 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors text-sm flex items-center gap-2"
                >
                  <CalendarClock size={16} /> Hoy
                </button>
              )}
              <h2 className="text-lg md:text-xl font-bold text-gray-800 text-center min-w-[220px] md:min-w-[300px]">
                {formattedWeekTitle}
              </h2>
            </div>
            <button
              onClick={semanaSiguiente}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Semana siguiente"
            >
              <ChevronRight size={22} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-end">
            {selected && (
              <span className="text-sm text-gray-600">
                Comedor: <strong>{selected.nombre}</strong>
              </span>
            )}
            <SucursalSelect />
          </div>
        </div>
      </div>

      <div className="relative">
        {mostrarLoader && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 z-10">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-gray-600">Cargando menús...</p>
          </div>
        )}

        <div className={mostrarLoader ? "pointer-events-none opacity-50" : ""}>
          <div className="space-y-6 md:space-y-8">
            {DIAS_SEMANA.map((dia, index) => {
              const fechaISO = formatearFechaISO(fechasSemana[index]);
              const asignadosPorComida = menusPorDiaComida[fechaISO] || {};
              const tieneMenuAsignado = Object.values(asignadosPorComida).flat().length > 0;
              const tieneMenuAlmuerzo = (asignadosPorComida['Almuerzo'] || []).length > 0;
              
              // Verificamos si hay observación para este día
              const tieneObservacion = !!observaciones[fechaISO];

              return (
                <div
                  key={dia}
                  className="bg-white rounded-2xl shadow-md p-4 md:p-6 flex flex-col gap-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <span className="text-lg md:text-xl font-extrabold">{dia}</span>
                            <span className="text-xs md:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                {formatearFecha(fechasSemana[index])}
                            </span>
                            {tieneMenuAsignado ? (
                                <span className="text-[11px] md:text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium">
                                Con menú asignado
                                </span>
                            ) : (
                                <span className="text-[11px] md:text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg font-medium">
                                Sin menú
                                </span>
                            )}
                        </div>
                        {/* VISUALIZACIÓN DE LA OBSERVACIÓN */}
                        {tieneObservacion && (
                            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded mt-1 max-w-md break-words shadow-sm">
                                <span className="font-bold mr-1">📝 Nota:</span> {observaciones[fechaISO]}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* NUEVO BOTÓN DE OBSERVACIÓN */}
                      <button
                        onClick={() => handleAbrirObservacion(fechaISO)}
                        disabled={!sucursalId}
                        className={`p-2 rounded-lg transition-colors ${tieneObservacion ? 'text-amber-600 bg-amber-100 hover:bg-amber-200' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                        title={tieneObservacion ? "Editar observación" : "Agregar observación"}
                      >
                        <StickyNote size={18} />
                      </button>

                      <button
                        onClick={() => handleVerReporteDia(dia, fechaISO, comensales[dia])}
                        disabled={!tieneMenuAsignado || comensales[dia] === 0 || !sucursalId}
                        className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          !tieneMenuAsignado ? "No hay menús asignados este día" : 
                          comensales[dia] === 0 ? "Ingrese el número de comensales" : 
                          "Ver Reporte Nutricional Consolidado del Día"
                        }
                      >
                        <BarChart3 size={16} />
                        Reporte
                      </button>
                      
                      <User2 className="text-gray-500" />
                      <span className="text-gray-600 font-medium text-sm">Usuarios Almuerzo:</span>
                      <input
                        type="number"
                        min={0}
                        value={comensales[dia]}
                        onChange={(e) =>
                          setComensales((prev) => ({
                            ...prev,
                            [dia]: Number(e.target.value),
                          }))
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-300 font-bold"
                      />
                      <button
                        onClick={() => handleSaveComensales(dia, fechaISO)}
                        disabled={savingComensales === dia || !sucursalId || !tieneMenuAlmuerzo} 
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          !sucursalId ? "Seleccione un comedor" :
                          !tieneMenuAlmuerzo ? "Debe asignar un menú de almuerzo primero" :
                          "Guardar cantidad de usuarios para este día"
                        }
                      >
                        {savingComensales === dia ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Save size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {COMIDAS.map(({ tipo, color }) => (
                      <div key={tipo} className="flex flex-col gap-2">
                        <span className={`font-semibold ${color}`}>{tipo}</span>
                        <div className="space-y-2">
                          {(asignadosPorComida[tipo] || []).map((asignacion) => (
                            <div
                              key={asignacion.asignacionMenuId}
                              className="w-full border-2 border-blue-200 rounded-xl py-3 px-4 flex items-center justify-between bg-blue-50 group"
                            >
                              <span className="font-bold text-blue-700 truncate">
                                {asignacion.menu?.nombreMenu ?? "—"}
                              </span>
                              <button
                                onClick={() =>
                                  handleEliminarAsignacion(asignacion.asignacionMenuId)
                                }
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Eliminar asignación de menú"
                              >
                                <Trash2 className="text-red-500 hover:text-red-700" size={20} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          className="mt-2 w-full border-2 border-dashed border-gray-300 rounded-xl py-3 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                          onClick={() => handleAbrirModal(dia, tipo)}
                          disabled={!sucursalId}
                          title={!sucursalId ? "Seleccione un comedor" : "Asignar menú"}
                        >
                          <PlusCircle /> Asignar menú
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
            const fechaAsignacion =
              idx >= 0 ? formatearFechaISO(fechasSemana[idx]) : "";
            const tipoComida = modalInfo.comida;
            const menuIds = seleccionados.map((m) => m.menuId);
            
            const comensalesParaGuardar = tipoComida === 'Almuerzo' ? (comensales[modalInfo.dia] ?? 0) : 0;

            const dto = {
              fechaAsignacion,
              tipoComida,
              menuIds,
              comensales: comensalesParaGuardar,
            };

            // CORRECCIÓN 4: Usamos la función del hook
            const ok = await createAsignacionMenu(
              dto,
              () => alert("Asignación guardada exitosamente"),
              { sucursalId }
            );
            if (!ok) alert("Error al guardar la asignación");
          }}
        />
      )}

      <ReporteNutricionalDiaModal
        open={reporteModalOpen}
        onClose={() => setReporteModalOpen(false)}
        data={reporteData}
        isLoading={loadingReporte}
        error={errorReporte}
        fecha={reporteInfo.fecha}
        comensales={reporteInfo.comensales}
        sucursalNombre={reporteInfo.sucursalNombre}
      />
      
      <ObservacionModal
        open={obsModalOpen}
        onClose={() => setObsModalOpen(false)}
        fecha={obsModalInfo.fechaLegible}
        observacionInicial={obsModalInfo.texto}
        onSave={handleGuardarObservacion}
      />
    </section>
  );
}