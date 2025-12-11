import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

import { useSucursales } from "../hooks/useSucursales";
// Importamos getAsignacionMenus, getMenusConInsumosByDay Y LA NUEVA getObservacionDia
import { getAsignacionMenus, getMenusConInsumosByDay, getObservacionDia } from "../api/menus"; 
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// --- FUNCIONES DE UTILIDAD ---
const formatNumber = (num) => {
  if (num === null || num === undefined) return "0.00";
  return new Intl.NumberFormat('es-PE', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(num);
};

const convertirUnidad = (cantidad, unidad) => {
  const unidadLower = unidad?.toLowerCase() || '';
  
  if (unidadLower === 'g' || unidadLower === 'gramo' || unidadLower === 'gramos') {
    if (cantidad >= 1000) {
      return { total: cantidad / 1000, unidad: 'Kg' };
    }
    return { total: cantidad, unidad: 'g' };
  }
  
  if (unidadLower === 'ml' || unidadLower === 'mililitro' || unidadLower === 'mililitros') {
    if (cantidad >= 1000) {
      return { total: cantidad / 1000, unidad: 'L' };
    }
    return { total: cantidad, unidad: 'ml' };
  }
  
  return { total: cantidad, unidad: unidad };
};

export default function Reports() {
  const { selectedId: sucursalId, selected } = useSucursales();

  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(false);

  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [fechaParaImprimir, setFechaParaImprimir] = useState(null);
  const [imprimiendo, setImprimiendo] = useState(false);

  const refetch = useCallback(async () => {
    if (!sucursalId) return;
    setCargando(true);
    try {
      const data = await getAsignacionMenus({ sucursalId });
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setCargando(false);
    }
  }, [sucursalId]);

  useEffect(() => {
    setItems([]);
    if (sucursalId) refetch();
  }, [sucursalId, refetch]);

  // ... (funciones de calendario sin cambios) ...
  const obtenerPrimerDiaMes = (fecha) => new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  const generarDiasCalendario = (fecha) => {
    const primerDia = obtenerPrimerDiaMes(fecha);
    const primerDiaSemana = new Date(primerDia);
    primerDiaSemana.setDate(primerDia.getDate() - primerDia.getDay());
    const dias = [];
    const cursor = new Date(primerDiaSemana);
    for (let i = 0; i < 42; i++) {
      dias.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return dias;
  };
  const diasCalendario = useMemo(() => generarDiasCalendario(fechaSeleccionada), [fechaSeleccionada]);
  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const esDelMesActual = (fecha) => fecha.getMonth() === fechaSeleccionada.getMonth();
  const esHoy = (fecha) => fecha.toDateString() === new Date().toDateString();
  const obtenerNombreMes = (fecha) => fecha.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const mesAnterior = () =>
    setFechaSeleccionada((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() - 1);
      return d;
    });
  const mesSiguiente = () =>
    setFechaSeleccionada((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + 1);
      return d;
    });
  const menusPorDia = useMemo(() => {
    const acc = {};
    for (const it of items) {
      const key = format(parseISO(it.fechaAsignacion), "yyyy-MM-dd");
      (acc[key] ||= []).push({
        tipoComida: it.tipoComida,
        menu: it.menu,
        asignacionMenuId: it.asignacionMenuId,
      });
    }
    return acc;
  }, [items]);
  const obtenerMenusDelDia = (fecha) => {
    const key = format(fecha, "yyyy-MM-dd");
    return menusPorDia[key] || [];
  };
  const exportarPDF = async () => {
    // ... (función de exportar PDF sin cambios) ...
    const input = document.getElementById("calendario-pdf");
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 3, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let imgWidth = pageWidth - 40;
    let imgHeight = (canvas.height * imgWidth) / canvas.width;
    if (imgHeight > pageHeight - 40) {
      imgHeight = pageHeight - 40;
      imgWidth = (canvas.width * imgHeight) / canvas.height;
    }
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;
    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
    pdf.save("calendario-menus.pdf");
  };
  
  // ==================================================================
  // FUNCIÓN DE IMPRIMIR CON OBSERVACIONES INTEGRADAS
  // ==================================================================
  const imprimirMenuDelDia = async () => {
    if (!fechaParaImprimir) return;
    setImprimiendo(true);

    try {
      const fechaStr = format(fechaParaImprimir, "yyyy-MM-dd");
      const fechaLegible = format(fechaParaImprimir, "dd 'de' MMMM, yyyy", { locale: es });

      // 1. Obtener menús
      const menusAsignadosConDetalles = await getMenusConInsumosByDay(fechaStr, { sucursalId });

      // 2. Obtener observación del día (NUEVO)
      let observacionTexto = "";
      try {
        const obsData = await getObservacionDia(fechaStr, { sucursalId });
        if (obsData && obsData.observacion) {
            observacionTexto = obsData.observacion;
        }
      } catch (error) {
        console.warn("No se pudo obtener la observación o no existe", error);
        // No bloqueamos el reporte si falla la observación, solo la dejamos vacía
      }

      if (!menusAsignadosConDetalles || menusAsignadosConDetalles.length === 0) {
        alert('No hay menú registrado para este día.');
        setImprimiendo(false);
        return;
      }
      
      const asignacionAlmuerzo = menusAsignadosConDetalles.find(a => a.tipoComida === 'Almuerzo');
      const comensales = asignacionAlmuerzo?.comensales || menusAsignadosConDetalles[0]?.comensales || 0;

      if (comensales === 0) {
        alert("El número de comensales es 0. El reporte de compras no se puede generar.");
        setImprimiendo(false);
        return;
      }

      const categorias = ['Desayuno', 'Almuerzo', 'Cena'];
      const recetasPorCategoria = {};
      categorias.forEach(cat => {
        recetasPorCategoria[cat] = [];
      });

      menusAsignadosConDetalles.forEach(asig => {
        if (asig.menu && Array.isArray(asig.menu.recetas)) {
          asig.menu.recetas.forEach(receta => {
            const categoria = receta.tipoComida || asig.tipoComida;
            if (categorias.includes(categoria) && recetasPorCategoria[categoria]) {
              recetasPorCategoria[categoria].push(receta);
            }
          });
        }
      });
      
      // --- DISEÑO DEL PDF ---
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const logoUrl = `/logo-blima.jpg`;

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
          img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
          img.src = url;
        });
      };
      
      // --- ENCABEZADO ---
      let y = 40;
      
      try {
        const logoBase64 = await getImageBase64(logoUrl);
        pdf.addImage(logoBase64, 'JPEG', 40, 30, 50, 50);
      } catch (e) {
        console.error("No se pudo cargar el logo para el PDF:", e);
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor('#0a3761');
      pdf.text('SOCIEDAD DE BENEFICENCIA DE LIMA METROPOLITANA', pageWidth / 2, y, { align: 'center' });
      y += 16;
      
      pdf.setFontSize(11);
      pdf.setTextColor('#17405c');
      pdf.text('PROGRAMA SOCIAL DE APOYO ALIMENTARIO Y NUTRICIONAL', pageWidth / 2, y, { align: 'center' });
      y += 14;
      pdf.text('SERVICIO DE NUTRICIÓN', pageWidth / 2, y, { align: 'center' });
      y += 30;

      const nombreComedor = selected?.nombre?.toUpperCase() || 'COMEDOR';
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor('#0a3761');
      pdf.text(`${nombreComedor}  -  ${fechaLegible}`, pageWidth / 2, y, { align: 'center' });
      y += 16;

      pdf.setFontSize(11);
      pdf.setTextColor('#333');
      pdf.text(`Total de raciones: ${comensales}`, pageWidth / 2, y, { align: 'center' });
      y += 28;
      
      const marginX = 60;
      const maxInsumoWidth = pageWidth - (marginX + 30) - 150; 

      // --- CONTENIDO (RECETAS E INSUMOS) ---
      categorias.forEach(cat => {
        const recetas = recetasPorCategoria[cat];
        if (recetas && recetas.length > 0) {
          pdf.setFontSize(14);
          pdf.setTextColor(cat === 'Desayuno' ? '#2b7a78' : cat === 'Almuerzo' ? '#f9a826' : '#3a3a7a');
          pdf.text(cat, marginX, y);
          y += 16;
          
          recetas.forEach(receta => {
            pdf.setFontSize(11);
            pdf.setTextColor('#17405c');
            pdf.text(`• ${receta.nombre} (Para ${comensales} Raciones)`, marginX + 15, y);
            y += 16;
            
            if (receta.insumos && receta.insumos.length > 0) {
              pdf.setFontSize(10);
              pdf.setTextColor('#17405c');
              pdf.text('Insumos:', marginX + 20, y);
              y += 12;
              
              receta.insumos.forEach(insumo => {
                const cantidadPorRacion = insumo.cantidad || 0;
                const cantidadTotal = cantidadPorRacion * comensales;
                const { total, unidad } = convertirUnidad(cantidadTotal, insumo.unidadMedida);

                const textoInsumo = `- ${insumo.nombreInsumo}: ${formatNumber(total)} ${unidad}`;
                
                pdf.setFontSize(9);
                pdf.setTextColor('#555');
                
                const insumoLines = pdf.splitTextToSize(textoInsumo, maxInsumoWidth);
                pdf.text(insumoLines, marginX + 30, y);
                
                y += (insumoLines.length * 11);
                
                if (y > 780) { pdf.addPage(); y = 40; }
              });
            }
            y += 8;
            if (y > 780) { pdf.addPage(); y = 40; }
          });
          y += 10;
        }
      });
      
      // --- SECCIÓN DE OBSERVACIONES (NUEVO) ---
      if (observacionTexto) {
        y += 15; // Espacio antes de las observaciones
        
        // Verificar si necesitamos nueva página
        if (y > 750) { pdf.addPage(); y = 40; }

        // Título de la sección
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor('#d97706'); // Color ámbar/naranja para resaltar
        pdf.text('Adicionales / Observaciones:', marginX, y);
        y += 14;

        // Texto de la observación
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor('#333');
        
        // Ajuste de texto largo para la observación
        const anchoTextoObs = pageWidth - (marginX * 2);
        const lineasObs = pdf.splitTextToSize(observacionTexto, anchoTextoObs);
        
        pdf.text(lineasObs, marginX, y);
      }
      
      pdf.save(`Menu - ${fechaStr}.pdf`);
      
    } catch (err) {
      console.error('Error al generar el PDF:', err);
      if (err && err.message && err.message.includes('404')) {
        alert('No hay menús asignados en la fecha seleccionada.');
      } else {
        alert('Hubo un error al generar el PDF. Revise la consola para más detalles.');
      }
    }
    setImprimiendo(false);
  };

  return (
    <div>
      {/* ... (Renderizado del calendario, todo se mantiene igual) ... */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Calendar className="text-blue-600" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Calendario de Menús</h1>
            {selected && (
              <p className="text-gray-600">Comedor: <strong>{selected.nombre}</strong></p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportarPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            <FileText size={18} /> Exportar calendario
          </button>
          <button
            onClick={imprimirMenuDelDia}
            disabled={!fechaParaImprimir || imprimiendo}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow transition-colors ${
              fechaParaImprimir && !imprimiendo
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {imprimiendo ? "Generando..." : <><FileText size={18} /> Imprimir menú del día</>}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-xl p-3">
        <button onClick={mesAnterior} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
          <ChevronLeft size={22} />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 capitalize">
            {obtenerNombreMes(fechaSeleccionada)}
          </h2>
          {cargando && <p className="text-sm text-blue-600 mt-1">Cargando menús…</p>}
        </div>
        <button onClick={mesSiguiente} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
          <ChevronRight size={22} />
        </button>
      </div>
      <div id="calendario-pdf" className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-4 md:p-6">
        <div className="grid grid-cols-7 gap-1">
          {diasSemana.map((dia) => (
            <div key={dia} className="p-3 text-center font-semibold text-gray-700 bg-gray-100 rounded-lg">
              {dia}
            </div>
          ))}
          {diasCalendario.map((fecha, i) => {
            const menusAsignados = obtenerMenusDelDia(fecha);
            const esSeleccionado =
              fechaParaImprimir && fechaParaImprimir.toDateString() === fecha.toDateString();
            return (
              <div
                key={i}
                className={`min-h-[120px] p-2 border border-gray-200 rounded-lg cursor-pointer transition-shadow hover:shadow-md ${
                  esDelMesActual(fecha) ? "bg-white" : "bg-gray-50"
                } ${esHoy(fecha) ? "ring-2 ring-blue-500" : ""} ${
                  esSeleccionado ? "ring-2 ring-green-500 shadow-lg" : ""
                }`}
                onClick={() => setFechaParaImprimir(new Date(fecha))}
                title="Seleccionar día para imprimir menú"
              >
                <div
                  className={`text-sm font-semibold mb-2 ${
                    esDelMesActual(fecha) ? "text-gray-800" : "text-gray-400"
                  } ${esHoy(fecha) ? "text-blue-600" : ""} ${esSeleccionado ? "text-green-600" : ""}`}
                >
                  {fecha.getDate()}
                </div>
                <div className="space-y-1">
                  {menusAsignados.length > 0 ? (
                    ["Desayuno", "Almuerzo", "Cena"].map((tipo) => {
                      const asigs = menusAsignados.filter((a) => a.tipoComida === tipo);
                      return asigs.length
                        ? asigs.map((a, idx) => (
                            <div
                              key={tipo + "-" + idx}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded text-center whitespace-normal break-words"
                              title={a.menu?.nombreMenu}
                            >
                              <span className="font-bold">{tipo}:</span> {a.menu?.nombreMenu ?? "—"}
                            </div>
                          ))
                        : null;
                    })
                  ) : (
                    <div className="text-xs text-gray-400 text-center py-2">Sin menús</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
            <span>Día con menús</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 ring-2 ring-inset ring-blue-500 rounded"></div>
            <span>Día de hoy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 ring-2 ring-inset ring-green-500 rounded"></div>
            <span>Día seleccionado para imprimir</span>
          </div>
        </div>
      </div>
    </div>
  );
}