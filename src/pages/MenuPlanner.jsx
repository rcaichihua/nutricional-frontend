// src/pages/MenuPlanner.jsx
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
  RefreshCw,
} from "lucide-react";
import { format, getWeek, isSameWeek } from "date-fns";
import { es } from "date-fns/locale";
import { getMenus } from "../api/menus";
import SelectMenuModal from "../components/SelectMenuModal";
import { useAsignacionMenu } from "../hooks/useAsignacionMenu";

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

export default function MenuPlanner() {
  const { selectedId: sucursalId, selected } = useSucursales();
  const {
    asignacionMenu,
    createAsignacionMenu,
    deleteAsignacionMenu,
    fetchAsignacionMenus,
    loading,
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

  const handleGoToCurrentWeek = () => {
    const hoy = new Date();
    const lunes = new Date(hoy);
    const diaSemana = hoy.getDay();
    const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    lunes.setDate(hoy.getDate() - diasHastaLunes);
    setSemanaSeleccionada(lunes);
  };

  const [comensales, setComensales] = useState(
    DIAS_SEMANA.reduce((acc, dia) => ({ ...acc, [dia]: 0 }), {})
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({ dia: "", comida: "" });

  const [menus, setMenus] = useState([]);
const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
const [mostrarLoader, setMostrarLoader] = useState(false);
const isLoading = cargandoCatalogo || loading;

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

  // reinicia al cambiar de comedor y vuelve a cargar sus asignaciones
  useEffect(() => {
  // limpia contenedores dependientes del comedor anterior
  setMenusPorDiaComida({});
  setComensales(defaultComensales());

  if (sucursalId) {
    fetchAsignacionMenus({ sucursalId });
  }
}, [sucursalId, fetchAsignacionMenus]);

// carga de menús (catálogo) una sola vez
  useEffect(() => {
    getMenus().then(setMenus).catch(console.error);
  }, []);


  // Loader UX
  /*useEffect(() => {
    let t;
    if (cargandoMenus) {
      t = setTimeout(() => setMostrarLoader(true), 300);
    } else {
      setMostrarLoader(false);
    }
    return () => clearTimeout(t);
  }, [cargandoMenus]);*/

  // Agrupa SOLO la semana visible
  useEffect(() => {
    const agrupados = {};
    (asignacionMenu || [])
      .filter((a) => fechasSemanaSet.has(a.fechaAsignacion))
      .forEach((asig) => {
        const fecha = asig.fechaAsignacion;
        const tipo = asig.tipoComida;
        if (!agrupados[fecha]) agrupados[fecha] = {};
        if (!agrupados[fecha][tipo]) agrupados[fecha][tipo] = [];
        agrupados[fecha][tipo].push(asig);
      });
    setMenusPorDiaComida(agrupados);
  }, [asignacionMenu, fechasSemanaSet]);

  useEffect(() => {
  // Mapea fecha ISO -> nombre del día
  const fechaIsoToDia = new Map(
    fechasSemana.map((f, idx) => [formatearFechaISO(f), DIAS_SEMANA[idx]])
  );

  // Construye un objeto { "Lunes": 700, ... } a partir de las asignaciones de la semana visible
  const comxDia = {};

  (asignacionMenu || [])
    .filter(a => fechaIsoToDia.has(a.fechaAsignacion)) // solo la semana visible
    .forEach(a => {
      const dia = fechaIsoToDia.get(a.fechaAsignacion);
      // Regla: toma el primer comensales encontrado (o el mayor si prefieres)
      if (comxDia[dia] == null) {
        comxDia[dia] = a.comensales ?? 0;
      } else {
        // si prefieres quedarte con el mayor:
        // comxDia[dia] = Math.max(comxDia[dia], a.comensales ?? 0);
      }
    });
  // Aplica sobre el estado manteniendo el valor anterior en días sin asignación
  setComensales(prev => {
    const next = { ...prev };
    DIAS_SEMANA.forEach(dia => {
      if (comxDia[dia] != null) next[dia] = comxDia[dia];
    });
    return next;
  });
}, [asignacionMenu, fechasSemana, formatearFechaISO]);

  useEffect(() => {
    let active = true;
    setCargandoCatalogo(true);
    getMenus()
      .then(m => { if (active) setMenus(m); })
      .catch(console.error)
      .finally(() => { if (active) setCargandoCatalogo(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setMenusPorDiaComida({});
    setComensales(defaultComensales());
    if (sucursalId) {
      fetchAsignacionMenus({ sucursalId }); // el hook pone/quita su propio loading
    }
  }, [sucursalId, fetchAsignacionMenus]);

  useEffect(() => {
  let t;
  if (isLoading) {
    t = setTimeout(() => setMostrarLoader(true), 300);
  } else {
    setMostrarLoader(false);
  }
  return () => clearTimeout(t);
}, [isLoading]);

  // También refresca al cambiar sucursal (extra, por si ya estaba cargado)
  //useEffect(() => {
  //  if (sucursalId) fetchAsignacionMenus({ sucursalId });
  //}, [sucursalId, fetchAsignacionMenus]);

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

  const defaultComensales = () =>
  DIAS_SEMANA.reduce((acc, dia) => ({ ...acc, [dia]: 0 }), {});

  /*const handleRefetch = useCallback(async () => {
    if (!sucursalId) {
      alert("Selecciona un comedor primero.");
      return;
    }
    try {
      setCargandoMenus(true);
      //const data = 
      await fetchAsignacionMenus({ sucursalId }); // 👈 await
      // Opcional: debug para confirmar fechas normalizadas
      // console.log("Refetch fechas:", data.map(d => d.fechaAsignacion));
      setCargandoMenus(false);
    } catch (e) {
      console.error("Error al refrescar asignaciones:", e);
    } finally {
      setCargandoMenus(false);
    }
  }, [sucursalId, fetchAsignacionMenus]);*/

  return (
    <section key={sucursalId ?? 'no-sucursal'}>
      {/* CABECERA RESPONSIVE */}
      <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 mb-6">
        <div className="flex flex-col gap-4">
          {/* Fila 1: navegación de semana */}
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

          {/* Fila 2: selector de sucursal + actualizar (wrap en mobile) */}
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

      {/* CUERPO */}
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
              return (
                <div
                  key={dia}
                  className="bg-white rounded-2xl shadow-md p-4 md:p-6 flex flex-col gap-4"
                >
                  {/* Encabezado del día */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg md:text-xl font-extrabold">{dia}</span>
                      <span className="text-xs md:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        {formatearFecha(fechasSemana[index])}
                      </span>
                      {Object.values(asignadosPorComida).flat().length > 0 ? (
                        <span className="text-[11px] md:text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium">
                          Con menú asignado
                        </span>
                      ) : (
                        <span className="text-[11px] md:text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg font-medium">
                          Sin menú
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <User2 className="text-gray-500" />
                      <span className="text-gray-600 font-medium text-sm">Usuarios Almuerzo:</span>
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

                  {/* Comidas responsive: 1 col en móvil, 3 cols en md+ */}
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

      {/* Modal */}
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
            const dto = {
              fechaAsignacion,
              tipoComida,
              menuIds,
              comensales: comensales[modalInfo.dia] ?? 0,
            };

            const ok = await createAsignacionMenu(
              dto,
              () => alert("Asignación guardada exitosamente"),
              { sucursalId }
            );
            if (!ok) alert("Error al guardar la asignación");
          }}
        />
      )}
    </section>
  );
}
