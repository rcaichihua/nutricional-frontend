import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar, FileText, List } from "lucide-react"; 
import { format, parseISO, startOfWeek, addDays } from "date-fns"; 
import { es } from "date-fns/locale";

import { useSucursales } from "../hooks/useSucursales";
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
  // IMPRIMIR MENÚ DEL DÍA (Lista de Compras)
  // ==================================================================
  const imprimirMenuDelDia = async () => {
    if (!fechaParaImprimir) return;
    setImprimiendo(true);

    try {
      const fechaStr = format(fechaParaImprimir, "yyyy-MM-dd");
      const fechaLegible = format(fechaParaImprimir, "dd 'de' MMMM, yyyy", { locale: es });

      const menusAsignadosConDetalles = await getMenusConInsumosByDay(fechaStr, { sucursalId });

      let observacionTexto = "";
      try {
        const obsData = await getObservacionDia(fechaStr, { sucursalId });
        if (obsData && obsData.observacion) {
            observacionTexto = obsData.observacion;
        }
      } catch (error) { console.warn(error); }

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
      
      let y = 40;
      try {
        const logoBase64 = await getImageBase64(logoUrl);
        pdf.addImage(logoBase64, 'JPEG', 40, 30, 50, 50);
      } catch (e) { console.error(e); }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor('#0a3761');
      pdf.text('SOCIEDAD DE BENEFICENCIA DE LIMA METROPOLITANA', pageWidth / 2, y, { align: 'center' });
      y += 14;
      pdf.setFontSize(11);
      pdf.setTextColor('#17405c');
      pdf.text('PROGRAMA SOCIAL DE APOYO ALIMENTARIO Y NUTRICIONAL', pageWidth / 2, y, { align: 'center' });
      y += 12;
      pdf.text('SERVICIO DE NUTRICIÓN', pageWidth / 2, y, { align: 'center' });
      y += 25;

      const nombreComedor = selected?.nombre?.toUpperCase() || 'COMEDOR';
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor('#0a3761');
      pdf.text(`${nombreComedor}  -  ${fechaLegible}`, pageWidth / 2, y, { align: 'center' });
      y += 14;

      pdf.setFontSize(11);
      pdf.setTextColor('#333');
      pdf.text(`Total de raciones: ${comensales}`, pageWidth / 2, y, { align: 'center' });
      y += 20;
      
      const marginX = 60;
      const maxInsumoWidth = pageWidth - (marginX * 2) - 20; 

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
            pdf.text(`• ${receta.nombre}`, marginX + 15, y);
            y += 16;
            
            if (receta.insumos && receta.insumos.length > 0) {
              pdf.setFontSize(10);
              pdf.setTextColor('#17405c');
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
            y += 6;
            if (y > 780) { pdf.addPage(); y = 40; }
          });
          y += 8;
        }
      });
      
      if (observacionTexto) {
        y += 15; 
        if (y > 750) { pdf.addPage(); y = 40; }
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor('#d97706'); 
        pdf.text('Adicionales / Observaciones:', marginX, y);
        y += 14;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor('#333');
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

  // ==================================================================
  // REPORTE SEMANAL DETALLADO (HORIZONTAL MEJORADO)
  // ==================================================================
  const imprimirReporteSemanal = async () => {
    if (!fechaParaImprimir) {
        alert("Selecciona un día en el calendario para identificar la semana a imprimir.");
        return;
    }
    setImprimiendo(true);

    try {
        const fechaInicioSemana = startOfWeek(fechaParaImprimir, { weekStartsOn: 1 });
        const diasSemanaArr = [];
        for (let i = 0; i < 7; i++) {
            diasSemanaArr.push(addDays(fechaInicioSemana, i));
        }

        const promesas = diasSemanaArr.map(fecha => 
            getMenusConInsumosByDay(format(fecha, "yyyy-MM-dd"), { sucursalId })
                .then(data => ({ date: fecha, menus: data || [] }))
                .catch(() => ({ date: fecha, menus: [] }))
        );
        const resultadosSemana = await Promise.all(promesas);

        const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        const marginX = 20;
        const colWidth = (pageWidth - (marginX * 2)) / 7;
        let y = 40;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor("#0a3761");
        const nombreComedor = selected?.nombre?.toUpperCase() || "COMEDOR";
        doc.text(`PROGRAMACIÓN SEMANAL DE MENÚS - ${nombreComedor}`, pageWidth / 2, y, { align: "center" });
        y += 20;
        
        doc.setFontSize(11);
        doc.setTextColor("#555");
        const rangoFechas = `Semana del ${format(diasSemanaArr[0], "dd/MM")} al ${format(diasSemanaArr[6], "dd/MM/yyyy")}`;
        doc.text(rangoFechas, pageWidth / 2, y, { align: "center" });
        y += 25;

        const startY = y;
        let maxY = y;

        // --- ENCABEZADOS DE COLUMNA ---
        resultadosSemana.forEach((dayData, i) => {
            const x = marginX + (i * colWidth);
            const fechaLegible = format(dayData.date, "EEEE dd", { locale: es }).toUpperCase();
            
            doc.setFillColor(230, 240, 255);
            doc.rect(x, startY, colWidth, 20, 'F');
            doc.rect(x, startY, colWidth, 20); // Borde encabezado

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor("#000");
            doc.text(fechaLegible, x + (colWidth / 2), startY + 14, { align: "center" });
        });

        const contentStartY = startY + 20;

        // --- CONTENIDO DE COLUMNAS ---
        resultadosSemana.forEach((dayData, i) => {
            const x = marginX + (i * colWidth);
            let currentY = contentStartY + 10;
            const menus = dayData.menus;

            if (menus.length === 0) {
                doc.setFont("helvetica", "italic");
                doc.setFontSize(8);
                doc.setTextColor("#888");
                doc.text("Sin programación", x + 5, currentY);
            } else {
                const porTipo = { 'Desayuno': [], 'Almuerzo': [], 'Cena': [] };
                menus.forEach(asig => {
                    if (!porTipo[asig.tipoComida]) porTipo[asig.tipoComida] = [];
                    porTipo[asig.tipoComida].push(asig);
                });

                ['Desayuno', 'Almuerzo', 'Cena'].forEach(tipo => {
                    const asignaciones = porTipo[tipo];
                    if (asignaciones.length > 0) {
                        // Título del tipo de comida (ej. ALMUERZO) - Solo UNA VEZ
                        doc.setFont("helvetica", "bold");
                        doc.setFontSize(8);
                        doc.setTextColor("#0a3761");
                        doc.text(tipo.toUpperCase(), x + 5, currentY);
                        
                        // Línea divisoria debajo del título de comida
                        doc.setDrawColor(200, 200, 200); 
                        doc.setLineWidth(0.5);
                        doc.line(x + 2, currentY + 3, x + colWidth - 2, currentY + 3);
                        
                        currentY += 12;

                        asignaciones.forEach(asig => {
                            if (asig.menu && asig.menu.recetas) {
                                const recetasOrdenadas = [...asig.menu.recetas].sort((a, b) => (a.orden || 0) - (b.orden || 0));

                                recetasOrdenadas.forEach((receta, index) => {
                                    doc.setFont("helvetica", "normal");
                                    doc.setFontSize(8);
                                    doc.setTextColor("#000");
                                    
                                    // CORRECCIÓN: Nombre de receta limpio y sin repetir categoría
                                    // Ej: "• Crema de Zapallo"
                                    const textoPlato = `• ${receta.nombre || receta.nombreReceta}`;
                                    
                                    const lines = doc.splitTextToSize(textoPlato, colWidth - 10);
                                    doc.text(lines, x + 5, currentY);
                                    
                                    // Más espacio entre recetas (12pt por línea)
                                    currentY += (lines.length * 10) + 6; 
                                });
                            }
                        });
                        currentY += 8; // Espacio entre tipos de comida
                    }
                });
            }
            if (currentY > maxY) maxY = currentY;
        });

        const finalHeight = Math.max(maxY, pageHeight - 30);
        resultadosSemana.forEach((_, i) => {
            const x = marginX + (i * colWidth);
            doc.setDrawColor(0);
            doc.setLineWidth(1);
            doc.rect(x, contentStartY, colWidth, finalHeight - contentStartY);
        });

        doc.save(`Reporte_Semanal_${format(diasSemanaArr[0], "yyyy-MM-dd")}.pdf`);

    } catch (error) {
        console.error("Error al generar reporte semanal:", error);
        alert("Hubo un error al generar el reporte semanal.");
    } finally {
        setImprimiendo(false);
    }
  };


  return (
    <div>
      {/* Barra superior */}
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
           {/* BOTÓN NUEVO: REPORTE SEMANAL */}
           <button
            onClick={imprimirReporteSemanal}
            disabled={!fechaParaImprimir || imprimiendo}
            className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors ${
              !fechaParaImprimir ? "bg-gray-300 text-gray-500 cursor-not-allowed" : ""
            }`}
            title="Selecciona un día en el calendario para imprimir la semana correspondiente"
          >
             {imprimiendo ? "Generando..." : <><List size={18} /> Reporte Semanal</>}
          </button>

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
      {/* ... (Resto del componente sin cambios) ... */}
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