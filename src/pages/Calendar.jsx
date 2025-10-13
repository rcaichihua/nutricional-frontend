// src/pages/Calendar.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";

import { useSucursales } from "../hooks/useSucursales";
import { getAsignacionMenus } from "../api/menus"; // 👈 filtra por sucursal
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Reports() {
  const { selectedId: sucursalId, selected } = useSucursales();

  // asignaciones "lite" (con menú {menuId, nombreMenu}, sin recetas)
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(false);

  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [fechaParaImprimir, setFechaParaImprimir] = useState(null);
  const [imprimiendo, setImprimiendo] = useState(false);

  // === Carga por sucursal ===
  const refetch = useCallback(async () => {
    if (!sucursalId) return;
    setCargando(true);
    try {
      const data = await getAsignacionMenus({ sucursalId }); // ?sucursalId=...
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setCargando(false);
    }
  }, [sucursalId]);

  useEffect(() => {
    // limpia al cambiar de comedor y vuelve a cargar
    setItems([]);
    if (sucursalId) refetch();
  }, [sucursalId, refetch]);

  // === Utilidades de fechas ===
  const obtenerPrimerDiaMes = (fecha) => new Date(fecha.getFullYear(), fecha.getMonth(), 1);

  const generarDiasCalendario = (fecha) => {
    const primerDia = obtenerPrimerDiaMes(fecha);
    const primerDiaSemana = new Date(primerDia);
    // domingo=0 → retrocede hasta el domingo anterior para llenar 6 filas
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

  // === Agrupar por día (normalizando YYYY-MM-DD) ===
  const menusPorDia = useMemo(() => {
    const acc = {};
    for (const it of items) {
      // viene como "YYYY-MM-DD" → normaliza con parseISO+format para evitar TZ issues
      const key = format(parseISO(it.fechaAsignacion), "yyyy-MM-dd");
      (acc[key] ||= []).push({
        tipoComida: it.tipoComida,
        menu: it.menu, // {menuId, nombreMenu}
        asignacionMenuId: it.asignacionMenuId,
      });
    }
    return acc;
  }, [items]);

  const obtenerMenusDelDia = (fecha) => {
    const key = format(fecha, "yyyy-MM-dd");
    return menusPorDia[key] || [];
  };

  // === Exportar calendario a PDF (igual que tenías) ===
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

  // === Imprimir menú del día (nota) ===
// Función para imprimir el menú del día seleccionado
  const imprimirMenuDelDia = async () => {
    if (!fechaParaImprimir) return;
    setImprimiendo(true);
    try {
      const fechaStr = fechaParaImprimir.toISOString().split('T')[0];
      // Obtener todos los menús asignados a ese día
      const menusAsignados = menus.filter(m => m.fechaAsignacion === fechaStr);
      if (!menusAsignados || menusAsignados.length === 0) {
        alert('No hay menú registrado para este día.');
        setImprimiendo(false);
        return;
      }
      // Agrupar recetas por tipoComida de todos los menús
      const categorias = ['Desayuno', 'Almuerzo', 'Cena'];
      const recetasPorCategoria = {};
      categorias.forEach(cat => {
        recetasPorCategoria[cat] = [];
      });
      menusAsignados.forEach(asig => {
        if (asig.menu && Array.isArray(asig.menu.recetas)) {
          asig.menu.recetas.forEach(receta => {
            if (categorias.includes(receta.tipoComida)) {
              recetasPorCategoria[receta.tipoComida].push(receta);
            }
          });
        }
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
      pdf.text(`Menús asignados del ${fechaStr}`, pageWidth / 2, y, { align: 'center' });
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
          <button
            onClick={exportarPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            <FileText size={18} /> Exportar calendario a PDF
          </button>
          <button
            onClick={imprimirMenuDelDia}
            disabled={!fechaParaImprimir || imprimiendo}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow transition-colors ${
              fechaParaImprimir
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <FileText size={18} /> Imprimir menú del día
          </button>
        </div>
      </div>

      {/* Selector mes */}
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

      {/* Calendario */}
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
                className={`min-h-[120px] p-2 border border-gray-200 rounded-lg cursor-pointer ${
                  esDelMesActual(fecha) ? "bg-white" : "bg-gray-50"
                } ${esHoy(fecha) ? "ring-2 ring-blue-500" : ""} ${
                  esSeleccionado ? "ring-2 ring-green-500" : ""
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

        {/* Leyenda */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
            <span>Con menús</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
            <span>Sin menús</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Hoy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Día seleccionado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
