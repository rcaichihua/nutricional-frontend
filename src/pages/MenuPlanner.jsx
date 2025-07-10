import { useState, useEffect, useMemo, useCallback } from "react";
import { User2, PlusCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useRecetas } from "../hooks/useRecetas";
import { getMenus, crearMenu, editarMenu } from "../api/menus";
import SelectRecipeModal from "../components/SelectRecipeModal";

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
  const { recetasConInsumos } = useRecetas();
  
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

  // Obtener todos los menús al montar el componente
  useEffect(() => {
    const obtenerMenus = async () => {
      setCargandoMenus(true);
      try {
        const menusObtenidos = await getMenus();
        setMenus(menusObtenidos);
      } catch (error) {
        // Error al obtener menús
      } finally {
        setCargandoMenus(false);
      }
    };

    obtenerMenus();
  }, []);

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
      alert('Error al guardar el menú');
    } finally {
      setGuardando(prev => ({ ...prev, [dia]: false }));
    }
  }, [fechasSemana, formatearFechaISO, menus, seleccionadas]);

  // Memoizar handlers para evitar re-renders innecesarios
  const handleAbrirModal = useCallback((dia, comida) => {
    setModalInfo({ dia, comida });
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
            {cargandoMenus && (
              <p className="text-xs text-blue-600 mt-1">Cargando menús...</p>
            )}
          </div>
          
          <button
            onClick={semanaSiguiente}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {cargandoMenus ? (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Cargando menús...</p>
        </div>
      ) : (
        <div className="space-y-8">
        {DIAS_SEMANA.map((dia, index) => (
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
                {tieneRecetas(dia) ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium">
                    Con recetas
                  </span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg font-medium">
                    Sin recetas
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
            {/* Comidas */}
            <div className="flex flex-col md:flex-row gap-4">
              {COMIDAS.map(({ tipo, color }) => (
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
      )}
      {/* Modal */}
      <SelectRecipeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        recetas={recetasConInsumos}
        dia={modalInfo.dia}
        comida={modalInfo.comida}
        onSelect={handleSeleccionarReceta}
        seleccionadas={seleccionadas}
      />
    </section>
  );
}
