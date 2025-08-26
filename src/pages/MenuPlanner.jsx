import { useState, useEffect, useMemo, useCallback } from "react";
import { User2, PlusCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
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
  const { asignacionMenu, createAsignacionMenu } = useAsignacionMenu();
  const { recetasConInsumos } = useRecetas({ onlyConInsumos: true });

  // Nuevo estado: menús asignados por día y tipoComida
  const [menusPorDiaComida, setMenusPorDiaComida] = useState({});

  useEffect(() => {
    // Agrupa las asignaciones por fechaAsignacion y tipoComida
    const agrupados = {};
    asignacionMenu.forEach((asig) => {
      const fecha = asig.fechaAsignacion;
      const tipo = asig.tipoComida;
      if (!agrupados[fecha]) agrupados[fecha] = {};
      if (!agrupados[fecha][tipo]) agrupados[fecha][tipo] = [];
      agrupados[fecha][tipo].push(asig.menu);
    });
    setMenusPorDiaComida(agrupados);
  }, [asignacionMenu]);

  // Estado para la semana seleccionada
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(() => {
    const hoy = new Date();
    const lunes = new Date(hoy);
    // Corregir el cálculo del lunes (0 = domingo, 1 = lunes, etc.)
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

  // Estado para almacenar los menús obtenidos
  const [menus, setMenus] = useState([]);
  const [cargandoMenus, setCargandoMenus] = useState(true);
  // Estado para mostrar el loader solo si la carga tarda más de 300ms
  const [mostrarLoader, setMostrarLoader] = useState(false);

  // Centralizar el refetch de menús y asignaciones
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

  // Efecto para mostrar el loader solo si la carga tarda más de 300ms
  useEffect(() => {
    let timer;
    if (cargandoMenus) {
      timer = setTimeout(() => setMostrarLoader(true), 300);
    } else {
      setMostrarLoader(false);
    }
    return () => clearTimeout(timer);
  }, [cargandoMenus]);

  // Refrescar al montar el componente
  useEffect(() => {
    refetchMenusYAsignaciones();
  }, [refetchMenusYAsignaciones]);

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

  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  // Función para formatear fecha en formato YYYY-MM-DD
  const formatearFechaISO = useCallback((fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Memoizar fechas de la semana
  const fechasSemana = useMemo(() => 
    obtenerFechasSemana(semanaSeleccionada), 
    [semanaSeleccionada]
  );

 
  // Memoizar función de verificación de recetas
  const tieneRecetas = useCallback((dia) => {
    const recetasDia = seleccionadas[dia];
    if (!recetasDia) return false;
    return Object.values(recetasDia).some(recetas => recetas && recetas.length > 0);
  }, [seleccionadas]);

  // Memoizar función de carga de recetas
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

  // Optimizar el useEffect para evitar cálculos innecesarios
  useEffect(() => {
    const nuevasSeleccionadas = {};
    
    // Usar Map para búsquedas más eficientes
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

  // Función para guardar un día específico
  const handleGuardarDia = useCallback(async (dia) => {
    setGuardando(prev => ({ ...prev, [dia]: true }));
    
    try {
      // Obtener la fecha del día seleccionado
      const indexDia = DIAS_SEMANA.indexOf(dia);
      const fechaDia = fechasSemana[indexDia];
      const fechaFormateada = formatearFechaISO(fechaDia);
      
      // Verificar si ya existe un menú para esta fecha
      const menuExistente = menus.find(menu => menu.fechaMenu === fechaFormateada);
      
      // Construir el array de todas las recetas (existentes + nuevas)
      const todasLasRecetas = [];
      const recetasDia = seleccionadas[dia] || {};
      
      // Recorrer cada tipo de comida
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
      
      // Si no hay recetas seleccionadas, mostrar mensaje
      if (todasLasRecetas.length === 0) {
        alert(`No hay recetas seleccionadas para el ${dia}.`);
        return;
      }
      
      // Construir el objeto del menú
      const menuData = {
        nombreMenu: `Menú del ${fechaFormateada}`,
        fechaMenu: fechaFormateada,
        descripcion: "-",
        tipoMenu: "Diario",
        recetas: todasLasRecetas
      };
      
      let menuResultado;
      
      if (menuExistente) {
        // Si existe, editar el menú existente        
        menuResultado = await editarMenu({
          ...menuExistente,
          ...menuData
        });
               
        // Actualizar la lista de menús localmente
        setMenus(prev => prev.map(menu => 
          menu.menuId === menuExistente.menuId ? menuResultado : menu
        ));
        
        alert(`¡Menú del ${dia} actualizado exitosamente!`);
      } else {
        // Si no existe, crear nuevo menú
        menuResultado = await crearMenu(menuData);
        
        // Actualizar la lista de menús localmente
        setMenus(prev => [...prev, menuResultado]);
        
        alert(`¡Menú del ${dia} creado exitosamente!`);
      }
      
    } catch (error) {
      alert('Error al guardar el menú', error);
    } finally {
      setGuardando(prev => ({ ...prev, [dia]: false }));
    }
  }, [fechasSemana, formatearFechaISO, menus, seleccionadas]);

  // Memoizar handlers para evitar re-renders innecesarios
  const handleAbrirModal = useCallback((dia, tipoComida) => {
    setModalInfo({ dia, comida: tipoComida });
    setModalOpen(true);
  }, []);

  const handleSeleccionarReceta = useCallback((receta) => {
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
            {/* Eliminado texto duplicado de carga, solo se muestra el loader superpuesto */}
          </div>
          
          <button
            onClick={semanaSiguiente}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Renderiza el contenido principal siempre, y superpone el loader si mostrarLoader es true */}
      <div className="relative">
        {mostrarLoader && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-70 z-10">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Cargando menús...</p>
          </div>
        )}
        <div className={mostrarLoader ? "pointer-events-none opacity-50" : ""}>
          {/* ...contenido principal... */}
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
                  {/* Menús asignados por tipo de comida */}
                  <div className="flex flex-col md:flex-row gap-4">
                    {COMIDAS.map(({ tipo, color }) => (
                      <div key={tipo} className="flex-1 flex flex-col gap-2">
                        <span className={`font-semibold ${color}`}>{tipo}</span>
                        <div className="space-y-2">
                          {(asignadosPorComida[tipo] || []).map((menu, idx) => (
                            <div
                              key={menu.menuId + '-' + tipo + '-' + fechaISO}
                              className="w-full border-2 border-blue-200 rounded-xl py-3 px-4 flex items-center justify-between bg-blue-50"
                            >
                              <span className="font-bold text-blue-700">
                                {menu.nombreMenu}
                              </span>
                              {/* Aquí podrías agregar botón para quitar menú si lo necesitas */}
                            </div>
                          ))}
                        </div>
                        {/* Botón para agregar menú a este tipo de comida */}
                        <button
                          className="mt-2 w-full border-2 border-dashed border-gray-300 rounded-xl py-3 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 transition"
                          onClick={() => handleAbrirModal(dia, tipo)}
                        >
                          <PlusCircle /> Asignar menu
                        </button>
                      </div>
                    ))}
                  </div>
                  {/* Aquí podrías agregar botón de guardar asignación si lo necesitas */}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Modal */}
      {/* <SelectRecipeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        recetas={recetasConInsumos}
        dia={modalInfo.dia}
        comida={modalInfo.comida}
        onSelect={handleSeleccionarReceta}
        seleccionadas={seleccionadas}
      /> */}
      {/* --- Modal simplificado --- */}
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
            // Si necesitas refrescar menús, puedes llamar refetchMenusYAsignaciones aquí
          }}
        />
      )}
    </section>
  );
};