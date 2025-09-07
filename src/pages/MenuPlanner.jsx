import { useState, useEffect, useMemo, useCallback } from "react";
import { User2, PlusCircle, Trash2, ChevronLeft, ChevronRight } from "lucide-react"; // 1. Se añade el ícono Trash2
import { format, getWeek } from 'date-fns';
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
  // 2. Se importa la nueva función de eliminación del hook
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
      // 3. Cambio clave: Se guarda la asignación completa (no solo el menú) para tener el ID de asignación
      agrupados[fecha][tipo].push(asig);
    });
    setMenusPorDiaComida(agrupados);
  }, [asignacionMenu]);

  // --- 4. NUEVA FUNCIÓN PARA MANEJAR LA ELIMINACIÓN ---
  const handleEliminarAsignacion = useCallback(async (asignacionMenuId) => {
    // Diálogo de confirmación para seguridad
    if (window.confirm("¿Estás seguro de que deseas eliminar este menú asignado?")) {
      const success = await deleteAsignacionMenu(asignacionMenuId);
      
      if (!success) {
        alert("Hubo un error al eliminar la asignación.");
      }
    }
  }, [deleteAsignacionMenu]);
  // --- FIN DE LA NUEVA FUNCIÓN ---

  const [semanaSeleccionada, setSemanaSeleccionada] = useState(() => {
    const hoy = new Date();
    const lunes = new Date(hoy);
    const diaSemana = hoy.getDay();
    const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    lunes.setDate(hoy.getDate() - diasHastaLunes);
    return lunes;
  });

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
    return `Semana ${weekNumber}: ${format(weekStart, 'd MMM')} - ${format(weekEnd, 'd MMM, yyyy', { locale: es })}`;
  }, [fechasSemana]);

  const tieneRecetas = useCallback((dia) => {
    const recetasDia = seleccionadas[dia];
    if (!recetasDia) return false;
    return Object.values(recetasDia).some(recetas => recetas && recetas.length > 0);
  }, [seleccionadas]);

  const cargarRecetasDeMenuMemo = useCallback((fecha) => {
    const menuEncontrado = menus.find(menu => menu.fechaMenu === fecha);
    
    if (menuEncontrado) {
      const recetasOrganizadas = {};
      
      COMIDAS.forEach(({ tipo }) => {
        recetasOrganizadas[tipo] = [];
      });
      
      menuEncontrado.recetas.forEach(recetaMenu => {
        const tipoComida = recetaMenu.tipoComida;
        
        if (recetasOrganizadas[tipoComida]) {
          const recetaCompleta = recetasConInsumos.find(r => r.recetaId === recetaMenu.recetaId);
          if (recetaCompleta) {
            recetasOrganizadas[tipoComida].push(recetaCompleta);
          }
        }
      });
      
      return recetasOrganizadas;
    }
    return null;
  }, [menus, recetasConInsumos]);

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

  useEffect(() => {
    const nuevasSeleccionadas = {};
    
    const menusMap = new Map(menus.map(menu => [menu.fechaMenu, menu]));
    
    fechasSemana.forEach((fecha, index) => {
      const dia = DIAS_SEMANA[index];
      const fechaISO = formatearFechaISO(fecha);
      
      const menuEncontrado = menusMap.get(fechaISO);
      
      if (menuEncontrado) {
        const recetasOrganizadas = {};
        
        COMIDAS.forEach(({ tipo }) => {
          recetasOrganizadas[tipo] = [];
        });
        
        menuEncontrado.recetas.forEach(recetaMenu => {
          const tipoComida = recetaMenu.tipoComida;
          
          if (recetasOrganizadas[tipoComida]) {
            const recetaCompleta = recetasConInsumos.find(r => r.recetaId === recetaMenu.recetaId);
            if (recetaCompleta) {
              recetasOrganizadas[tipoComida].push(recetaCompleta);
            }
          }
        });
        
        nuevasSeleccionadas[dia] = recetasOrganizadas;
      }
    });
    
    setSeleccionadas(nuevasSeleccionadas);
  }, [semanaSeleccionada, menus, recetasConInsumos, formatearFechaISO]);

  const handleGuardarDia = useCallback(async (dia) => {
    setGuardando(prev => ({ ...prev, [dia]: true }));
    
    try {
      const indexDia = DIAS_SEMANA.indexOf(dia);
      const fechaDia = fechasSemana[indexDia];
      const fechaFormateada = formatearFechaISO(fechaDia);
      
      const menuExistente = menus.find(menu => menu.fechaMenu === fechaFormateada);
      
      const todasLasRecetas = [];
      const recetasDia = seleccionadas[dia] || {};
      
      COMIDAS.forEach(({ tipo }) => {
        const recetasComida = recetasDia[tipo] || [];
        recetasComida.forEach((receta, index) => {
          todasLasRecetas.push({
            recetaId: receta.recetaId,
            tipoComida: tipo,
            orden: index + 1
          });
        });
      });
      
      if (todasLasRecetas.length === 0) {
        alert(`No hay recetas seleccionadas para el ${dia}.`);
        return;
      }
      
      const menuData = {
        nombreMenu: `Menú del ${fechaFormateada}`,
        fechaMenu: fechaFormateada,
        descripcion: "-",
        tipoMenu: "Diario",
        recetas: todasLasRecetas
      };
      
      let menuResultado;
      
      if (menuExistente) {
        menuResultado = await editarMenu({
          ...menuExistente,
          ...menuData
        });
        
        setMenus(prev => prev.map(menu => 
          menu.menuId === menuExistente.menuId ? menuResultado : menu
        ));
        
        alert(`¡Menú del ${dia} actualizado exitosamente!`);
      } else {
        menuResultado = await crearMenu(menuData);
        
        setMenus(prev => [...prev, menuResultado]);
        
        alert(`¡Menú del ${dia} creado exitosamente!`);
      }
      
    } catch (error) {
      alert('Error al guardar el menú', error);
    } finally {
      setGuardando(prev => ({ ...prev, [dia]: false }));
    }
  }, [fechasSemana, formatearFechaISO, menus, seleccionadas]);

  const handleAbrirModal = useCallback((dia, tipoComida) => {
    setModalInfo({ dia, comida: tipoComida });
    setModalOpen(true);
  }, []);

  const handleSeleccionarReceta = useCallback((receta) => {
    setSeleccionadas((prev) => {
      const recetasPorComida = prev[modalInfo.dia]?.[modalInfo.comida] || [];
      if (recetasPorComida.some((r) => r.recetaId === receta.recetaId)) {
        alert("¡Esta receta ya está asignada para este día y comida!");
        return prev;
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
  }, [modalInfo.dia, modalInfo.comida]);

  const handleEliminarReceta = useCallback((dia, comida, recetaIdx) => {
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
  }, []);

  return (
    <section>
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={semanaAnterior}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">
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
                      {Object.values(asignadosPorComida).flat().length > 0 ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium">
                          Con menú asignado
                        </span>
                      ) : (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg font-medium">
                          Sin menú
                        </span>
                      )}
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
                  <div className="flex flex-col md:flex-row gap-4">
                    {COMIDAS.map(({ tipo, color }) => (
                      <div key={tipo} className="flex-1 flex flex-col gap-2">
                        <span className={`font-semibold ${color}`}>{tipo}</span>
                        <div className="space-y-2">
                          {/* --- 5. BUCLE DE RENDERIZADO MODIFICADO --- */}
                          {(asignadosPorComida[tipo] || []).map((asignacion) => (
                            <div
                              key={asignacion.asignacionMenuId}
                              className="w-full border-2 border-blue-200 rounded-xl py-3 px-4 flex items-center justify-between bg-blue-50 group"
                            >
                              <span className="font-bold text-blue-700">
                                {asignacion.menu.nombreMenu}
                              </span>
                              {/* --- BOTÓN DE ELIMINAR --- */}
                              <button
                                onClick={() => handleEliminarAsignacion(asignacion.asignacionMenuId)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Eliminar asignación de menú"
                              >
                                <Trash2 className="text-red-500 hover:text-red-700" size={20} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          className="mt-2 w-full border-2 border-dashed border-gray-300 rounded-xl py-3 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 transition"
                          onClick={() => handleAbrirModal(dia, tipo)}
                        >
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
            // Se debe devolver la asignación completa, no solo el menú
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