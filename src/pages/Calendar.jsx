import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, FileText } from "lucide-react";
import { getMenus } from "../api/menus";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Reports() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [menus, setMenus] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Obtener menús al cargar el componente
  useEffect(() => {
    const cargarMenus = async () => {
      setCargando(true);
      try {
        const menusObtenidos = await getMenus();
        setMenus(menusObtenidos);
      } catch (error) {
        console.error('Error al cargar menús:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarMenus();
  }, []);

  // Función para obtener el primer día del mes
  const obtenerPrimerDiaMes = (fecha) => {
    return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  };

  // Función para obtener el último día del mes
  const obtenerUltimoDiaMes = (fecha) => {
    return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
  };

  // Función para generar días del calendario
  const generarDiasCalendario = (fecha) => {
    const primerDia = obtenerPrimerDiaMes(fecha);
    const ultimoDia = obtenerUltimoDiaMes(fecha);
    const primerDiaSemana = new Date(primerDia);
    primerDiaSemana.setDate(primerDia.getDate() - primerDia.getDay());

    const dias = [];
    const fechaActual = new Date(primerDiaSemana);

    // Generar 6 semanas (42 días) para cubrir todo el mes
    for (let i = 0; i < 42; i++) {
      dias.push(new Date(fechaActual));
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return dias;
  };

  // Función para obtener recetas de un día específico
  const obtenerRecetasDelDia = (fecha) => {
    const fechaFormateada = fecha.toISOString().split('T')[0];
    const menu = menus.find(m => m.fechaMenu === fechaFormateada);
    return menu ? menu.recetas : [];
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  // Función para obtener nombre del mes
  const obtenerNombreMes = (fecha) => {
    return fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  // Navegar al mes anterior
  const mesAnterior = () => {
    setFechaSeleccionada(prev => {
      const nuevaFecha = new Date(prev);
      nuevaFecha.setMonth(prev.getMonth() - 1);
      return nuevaFecha;
    });
  };

  // Navegar al mes siguiente
  const mesSiguiente = () => {
    setFechaSeleccionada(prev => {
      const nuevaFecha = new Date(prev);
      nuevaFecha.setMonth(prev.getMonth() + 1);
      return nuevaFecha;
    });
  };

  // Verificar si una fecha es del mes actual
  const esDelMesActual = (fecha) => {
    return fecha.getMonth() === fechaSeleccionada.getMonth();
  };

  // Verificar si una fecha es hoy
  const esHoy = (fecha) => {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  };

  // Función para exportar el calendario a PDF
  const exportarPDF = async () => {
    const input = document.getElementById("calendario-pdf");
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let y = 0;
    if (imgHeight > pageHeight) {
      y = 0;
    } else {
      y = (pageHeight - imgHeight) / 2;
    }
    pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
    pdf.save("calendario-menus.pdf");
  };

  const diasCalendario = generarDiasCalendario(fechaSeleccionada);
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div>
      {/* Botón de exportar PDF */}
      <div className="flex justify-end mb-4">
        <button
          onClick={exportarPDF}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          <FileText size={18} /> Exportar a PDF
        </button>
      </div>
      {/* Todo el contenido relevante dentro del div exportable */}
      <div id="calendario-pdf">
        <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-600" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Calendario de Menús</h1>
                <p className="text-gray-600">Visualiza las recetas asignadas por día</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <FileText className="text-green-600" size={24} />
              <span className="text-sm text-gray-500 px-2 py-1 whitespace-normal break-words" style={{background: 'rgba(255,255,255,0.85)', borderRadius: '6px'}}>
                {menus.length} menús registrados
              </span>
            </div>
          </div>
          {/* Selector de mes */}
          <div className="flex items-center justify-between mb-6 bg-gray-50 rounded-xl p-4">
            <button
              onClick={mesAnterior}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 capitalize">
                {obtenerNombreMes(fechaSeleccionada)}
              </h2>
              {cargando && (
                <p className="text-sm text-blue-600 mt-1">Cargando menús...</p>
              )}
            </div>
            <button
              onClick={mesSiguiente}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          {/* Calendario */}
          <div className="grid grid-cols-7 gap-1">
            {/* Días de la semana */}
            {diasSemana.map(dia => (
              <div key={dia} className="p-3 text-center font-semibold text-gray-700 bg-gray-100 rounded-lg">
                {dia}
              </div>
            ))}
            {/* Días del mes */}
            {diasCalendario.map((fecha, index) => {
              const recetas = obtenerRecetasDelDia(fecha);
              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-gray-200 rounded-lg ${
                    esDelMesActual(fecha) ? 'bg-white' : 'bg-gray-50'
                  } ${esHoy(fecha) ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {/* Número del día */}
                  <div className={`text-sm font-semibold mb-2 ${
                    esDelMesActual(fecha) ? 'text-gray-800' : 'text-gray-400'
                  } ${esHoy(fecha) ? 'text-blue-600' : ''}`}>
                    {fecha.getDate()}
                  </div>
                  {/* Recetas */}
                  <div className="space-y-1">
                    {recetas.length > 0 ? (
                      recetas.map((receta, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded text-center whitespace-normal break-words"
                          title={receta.nombreReceta}
                        >
                          {receta.nombreReceta}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-400 text-center py-2">
                        Sin recetas
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Leyenda */}
          <div className="mt-6 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
              <span className="whitespace-normal break-words">Con recetas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
              <span className="whitespace-normal break-words">Sin recetas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="whitespace-normal break-words">Hoy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}