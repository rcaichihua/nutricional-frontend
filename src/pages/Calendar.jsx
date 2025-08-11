import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, FileText } from "lucide-react";
import { getMenus, getMenusConInsumosByDay } from "../api/menus";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Reports() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [menus, setMenus] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [fechaParaImprimir, setFechaParaImprimir] = useState(null);
  const [imprimiendo, setImprimiendo] = useState(false);

  // Función para imprimir el menú del día seleccionado
  const imprimirMenuDelDia = async () => {
    if (!fechaParaImprimir) return;
    setImprimiendo(true);
    try {
      const fechaStr = fechaParaImprimir.toISOString().split('T')[0];
      const menuDiaArr = await getMenusConInsumosByDay(fechaStr);
      const menuDia = Array.isArray(menuDiaArr) ? menuDiaArr[0] : menuDiaArr;
      if (!menuDia || !menuDia.recetas || menuDia.recetas.length === 0) {
        alert('No hay menú registrado para este día.');
        setImprimiendo(false);
        return;
      }
      // Agrupar recetas por tipoComida
      const categorias = ['Desayuno', 'Almuerzo', 'Cena'];
      const recetasPorCategoria = {};
      categorias.forEach(cat => {
        recetasPorCategoria[cat] = menuDia.recetas.filter(r => r.tipoComida === cat);
      });
      // Crear PDF
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      let y = 60; // Altura título
      const pageWidth = pdf.internal.pageSize.getWidth();
      // Logo en la esquina superior derecha
      const logoUrl = `${window.location.origin}/logo-blima.jpg`;
      // Convertir imagen a base64
      const getImageBase64 = (url) => {
        return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.crossOrigin = 'Anonymous';
          img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg'));
          };
          img.onerror = function () {
            reject(new Error('No se pudo cargar la imagen'));
          };
          img.src = url;
        });
      };
      // Esperar la imagen y continuar
      const logoBase64 = await getImageBase64(logoUrl);
      pdf.addImage(logoBase64, 'JPEG', pageWidth - 80, 30, 60, 60);
      // Contenido del PDF
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      pdf.setTextColor('#0a3761');
      pdf.text('SOCIEDAD DE BENEFICENCIA DE LIMA METROPOLITANA', pageWidth / 2, y, { align: 'center' });
      y += 18;
      pdf.setFontSize(13);
      pdf.setTextColor('#17405c');
      pdf.text('PROGRAMA SOCIAL DE APOYO ALIMENTARIO Y NUTRICIONAL', pageWidth / 2, y, { align: 'center' });
      y += 16;
      pdf.setFontSize(13);
      pdf.setTextColor('#17405c');
      pdf.text('SERVICIO DE NUTRICIÓN', pageWidth / 2, y, { align: 'center' });
      y += 40;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      pdf.setTextColor('#0a3761');
      pdf.text('COMEDOR SANTA TERESITA', pageWidth / 2, y, { align: 'center' });
      y += 22;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(13);
      pdf.setTextColor('#17405c');
      pdf.text(menuDia.nombreMenu || `Menú del ${fechaStr}`, pageWidth / 2, y, { align: 'center' });
      y += 28;
      const marginX = 60; // margen adicional a la derecha
      categorias.forEach(cat => {
        const recetas = recetasPorCategoria[cat];
        if (recetas && recetas.length > 0) {
          pdf.setFontSize(16);
          pdf.setTextColor(cat === 'Desayuno' ? '#2b7a78' : cat === 'Almuerzo' ? '#f9a826' : '#3a3a7a');
          pdf.text(cat, marginX, y);
          y += 18;
          recetas.forEach(receta => {
            pdf.setFontSize(13);
            pdf.setTextColor('#17405c');
            pdf.text(`• ${receta.nombre}`, marginX + 15, y);
            y += 16;
            if (receta.descripcion) {
              pdf.setFontSize(11);
              pdf.setTextColor('#555');
              pdf.text(`  ${receta.descripcion}`, marginX + 20, y);
              y += 14;
            }
            pdf.setFontSize(11);
            pdf.setTextColor('#555');
            pdf.text(`  Raciones: ${receta.porciones}`, marginX + 20, y);
            y += 14;
            if (receta.insumos && receta.insumos.length > 0) {
              pdf.setFontSize(11);
              pdf.setTextColor('#17405c');
              pdf.text('  Insumos:', marginX + 20, y);
              y += 13;
              receta.insumos.forEach(insumo => {
                pdf.setFontSize(10);
                pdf.setTextColor('#555');
                pdf.text(`    - ${insumo.nombreInsumo}: ${insumo.cantidad} ${insumo.unidadMedida || ''}`, marginX + 30, y);
                y += 12;
              });
            }
            y += 8;
            if (y > 750) {
              pdf.addPage();
              y = 40;
            }
          });
          y += 10;
        }
      });
      pdf.save(`menu-${fechaStr}.pdf`);
    } catch (err) {
      alert('Error al generar el PDF', err);
    }
    setImprimiendo(false);
  };

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

  // Función para generar días del calendario
  const generarDiasCalendario = (fecha) => {
    const primerDia = obtenerPrimerDiaMes(fecha);
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
      {/* Botón de imprimir menú del día */}
      <div className="flex justify-end mb-4 gap-2">
        <button
          onClick={exportarPDF}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          <FileText size={18} /> Exportar calendario a PDF
        </button>
        <button
          onClick={imprimirMenuDelDia}
          disabled={!fechaParaImprimir || imprimiendo}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow transition-colors ${fechaParaImprimir ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          <FileText size={18} /> Imprimir menú del día
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
                <p className="text-gray-600">Recetas asignadas por día</p>
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
              const esSeleccionado = fechaParaImprimir && fechaParaImprimir.toDateString() === fecha.toDateString();
              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-gray-200 rounded-lg cursor-pointer ${
                    esDelMesActual(fecha) ? 'bg-white' : 'bg-gray-50'
                  } ${esHoy(fecha) ? 'ring-2 ring-blue-500' : ''} ${esSeleccionado ? 'ring-2 ring-green-500' : ''}`}
                  onClick={() => setFechaParaImprimir(new Date(fecha))}
                  title="Seleccionar día para imprimir menú"
                >
                  {/* Número del día */}
                  <div className={`text-sm font-semibold mb-2 ${
                    esDelMesActual(fecha) ? 'text-gray-800' : 'text-gray-400'
                  } ${esHoy(fecha) ? 'text-blue-600' : ''} ${esSeleccionado ? 'text-green-600' : ''}`}>
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
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="whitespace-normal break-words">Día seleccionado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}