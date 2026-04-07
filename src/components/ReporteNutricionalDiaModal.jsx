import { useRef } from "react";
// Importamos 'Label' para el gráfico de pastel
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Printer, X, Loader2 } from "lucide-react";

// Colores para el gráfico y resumen
const COLORS = ["#84fab0", "#17405c", "#8fd3f4"]; // Carbohidratos(verde), Proteínas(azul), Lípidos(celeste)

// --- Listas de Nutrientes (sin cambios) ---
const MACRONUTRIENTES = [
  { label: "Proteína animal", key: "proteinaAnimalGTotal" },
  { label: "Proteína vegetal", key: "proteinaVegetalGTotal" },
  { label: "Proteína total", key: "proteinaTotalG" },
  { label: "Grasa animal", key: "grasaAnimalGTotal" },
  { label: "Grasa vegetal", key: "grasaVegetalGTotal" },
  { label: "Grasa total", key: "grasaTotalG" },
  { label: "Carbohidratos", key: "choCarbohidratoGTotal" },
];
const VITAMINAS = [
  { label: "Vitamina A (Retinol)", key: "retinolMcgTotal" },
  { label: "Vitamina B1 (Tiamina)", key: "vitaminaB1TiaminaMgTotal" },
  { label: "Vitamina B2 (Riboflavina)", key: "vitaminaB2RiboflavinaMgTotal" },
  { label: "Vitamina B3 (Niacina)", key: "niacinaMgTotal" },
  { label: "Vitamina C", key: "vitaminaCMgTotal" },
];
const MINERALES = [
  { label: "Calcio animal", key: "calcioAnimalMgTotal" },
  { label: "Calcio vegetal", key: "calcioVegetalMgTotal" },
  { label: "Fósforo", key: "fosforoMgTotal" },
  { label: "Hierro hem", key: "hierroHemMgTotal" },
  { label: "Hierro no hem", key: "hierroNoHemMgTotal" },
  { label: "Hierro total", key: "hierroTotalMg" },
  { label: "Sodio", key: "sodioMgTotal" },
  { label: "Potasio", key: "potasioMgTotal" },
];
const OTROS = [
  { label: "Agua", key: "aguaGTotal" },
  { label: "Fibra", key: "fibraGTotal" },
];

// --- FUNCIONES DE UTILIDAD (sin cambios) ---
const formatNumber = (num) => {
  if (num === null || num === undefined) return "0.00";
  return new Intl.NumberFormat('es-PE', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(num);
};

const getUnit = (key) => {
  if (key.endsWith("GTotal")) return "g";
  if (key.endsWith("MgTotal")) return "mg";
  if (key.endsWith("McgTotal")) return "mcg";
  return "g";
};

// --- Componente de Tarjeta de Nutriente (Rediseñado) ---
// Usa un diseño de 'lista de definición' con líneas de puntos para alinear.
function SeccionNutrientes({ titulo, color, data, nutrientes }) {
  return (
    <div className="flex flex-col">
      <h4 className={`text-lg font-bold text-${color}-600 border-b-2 border-${color}-200 pb-2 mb-3`}>
        {titulo}
      </h4>
      <dl className="space-y-2">
        {nutrientes
          .filter(v => data[v.key] !== undefined && data[v.key] !== null)
          .map((v) => (
            <div key={v.key} className="flex justify-between items-baseline text-sm">
              <dt className="text-gray-600">{v.label}</dt>
              {/* Esta span crea la línea de puntos para alinear */}
              <span className="flex-1 border-b border-dotted border-gray-300 mx-2"></span>
              <dd className="font-mono font-bold text-gray-800">
                {formatNumber(data[v.key])} {getUnit(v.key)}
              </dd>
            </div>
          ))}
      </dl>
    </div>
  );
}

/**
 * Componente interno que renderiza el contenido del reporte (Rediseñado)
 */
function ReporteContenido({ data, fecha, comensales, sucursalNombre, onClose }) {
  const printRef = useRef();

  // --- Cálculos (sin cambios) ---
  const dataChart = [
    { name: "Carbohidratos", value: data.choCarbohidratoGTotal ?? 0 },
    { name: "Proteínas", value: data.proteinaTotalG ?? 0 },
    { name: "Lípidos", value: data.grasaTotalG ?? 0 },
  ];
  const kcalCarbs = (data.choCarbohidratoGTotal ?? 0) * 4;
  const proteTotal = data.proteinaTotalG ?? 0;
  const kcalProteinas = proteTotal * 4;
  const grasaTotal = data.grasaTotalG ?? 0;
  const kcalLipidos = grasaTotal * 9;
  const kcalTotal = data.energiaKcalTotal ?? (kcalCarbs + kcalProteinas + kcalLipidos);
  const percentCarbs = kcalTotal ? ((kcalCarbs * 100) / kcalTotal).toFixed(1) + "%" : "0%";
  const percentProteinas = kcalTotal ? ((kcalProteinas * 100) / kcalTotal).toFixed(1) + "%" : "0%";
  const percentLipidos = kcalTotal ? ((kcalLipidos * 100) / kcalTotal).toFixed(1) + "%" : "0%";
  const resumen = [
    { name: "Carbohidratos", color: COLORS[0], cantidad: formatNumber(data.choCarbohidratoGTotal ?? 0), kcal: formatNumber(kcalCarbs), percent: percentCarbs },
    { name: "Proteínas", color: COLORS[1], cantidad: formatNumber(proteTotal), kcal: formatNumber(kcalProteinas), percent: percentProteinas },
    { name: "Lípidos", color: COLORS[2], cantidad: formatNumber(grasaTotal), kcal: formatNumber(kcalLipidos), percent: percentLipidos },
  ];

  const handleDownloadPDF = async () => {
    // ... (lógica de PDF sin cambios) ...
    if (printRef.current) {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let position = 0;
      while (position < imgHeight) {
        pdf.addImage(imgData, "PNG", 0, -position, imgWidth, imgHeight);
        if (position + pageHeight < imgHeight) pdf.addPage();
        position += pageHeight;
      }
      pdf.save(`reporte-nutricional-${fecha}.pdf`);
    }
  };

  return (
    // Contenedor principal para el PDF
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8" ref={printRef}>
      
      {/* --- Encabezado del Reporte (con botones) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-4 border-b pb-4">
        {/* Lado Izquierdo: Títulos */}
        <div>
          <p className="text-xl font-semibold text-blue-700">{sucursalNombre}</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">Reporte Nutricional Consolidado</h2>
          <div className="flex flex-col sm:flex-row sm:gap-6 mt-2 text-lg text-gray-600">
            <span>{fecha}</span>
            <span className="font-bold">{comensales} Usuarios</span>
          </div>
        </div>
        {/* Lado Derecho: Botones (Ocultos en PDF) */}
        <div className="flex-shrink-0 flex gap-3 mt-4 md:mt-0 print:hidden">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
            onClick={handleDownloadPDF}
            title="Descargar PDF"
          >
            <Printer size={18} />
            Descargar
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={onClose}
            title="Cerrar modal"
          >
            <X size={18} />
            Cerrar
          </button>
        </div>
      </div>
      {/* Encabezado Oculto (Solo para Impresión) */}
      <div className="hidden print:block mb-4 text-center border-b pb-4">
        <p className="text-xl font-semibold text-blue-700">{sucursalNombre}</p>
        <h2 className="text-2xl font-bold text-gray-900 mt-1">Reporte Nutricional Consolidado</h2>
        <div className="flex justify-center gap-6 mt-2 text-lg text-gray-600">
          <span>{fecha}</span>
          <span className="font-bold">{comensales} Usuarios</span>
        </div>
      </div>


      {/* --- SECCIÓN 1: Resumen Principal (Gráfico + Tabla) --- */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-6 border-b pb-6">
        
        {/* Gráfico */}
        <div className="w-full md:w-1/3 flex items-center justify-center">
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataChart} cx="50%" cy="50%" outerRadius={85} innerRadius={60} dataKey="value" label={false}>
                  {dataChart.map((entry, i) => (<Cell key={i} fill={COLORS[i]} />))}
                </Pie>
                <Label 
                  value={`${formatNumber(kcalTotal)}`} 
                  position="center" 
                  className="text-2xl font-bold fill-gray-800"
                  dy={-5}
                />
                <Label 
                  value="Kcal Total" 
                  position="center" 
                  className="text-sm fill-gray-500"
                  dy={15}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Tabla Resumen (Con color y alineación corregida) */}
        <div className="w-full md:w-2/3 flex flex-col gap-2">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Resumen Calórico Total</h3>
          <div className="bg-blue-600 text-white rounded-xl p-4 shadow-lg">
            <div className="text-xl font-semibold text-center mb-3 text-white">
              Calorías Totales: {formatNumber(kcalTotal)} cal
            </div>
            {/* Encabezados */}
            <div className="grid grid-cols-4 items-center gap-3 mb-2 font-bold border-b border-blue-400 pb-2 text-sm text-blue-100">
              <span className="col-span-1">Nutriente</span>
              <span className="col-span-1 text-right">Cantidad (g)</span>
              <span className="col-span-1 text-right">Kcal (cal)</span>
              <span className="col-span-1 text-right">% Energía</span>
            </div>
            {/* Filas de datos */}
            {resumen.map((r) => (
              <div key={r.name} className="grid grid-cols-4 items-center gap-3 text-sm">
                <div className="col-span-1 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: r.color }}></span>
                  <span className="font-medium">{r.name}</span>
                </div>
                <span className="col-span-1 text-right font-mono">{r.cantidad}</span>
                <span className="col-span-1 text-right font-mono">{r.kcal}</span>
                <span className="col-span-1 text-right font-mono">{r.percent}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* --- SECCIÓN 2: Desglose de Nutrientes (Grid 2x2 Compacto) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
        <SeccionNutrientes titulo="Desglose de Macronutrientes" color="green" data={data} nutrientes={MACRONUTRIENTES} />
        <SeccionNutrientes titulo="Vitaminas" color="red" data={data} nutrientes={VITAMINAS} />
        <SeccionNutrientes titulo="Minerales" color="yellow" data={data} nutrientes={MINERALES} />
        <SeccionNutrientes titulo="Otros Componentes" color="gray" data={data} nutrientes={OTROS} />
      </div>
    </div>
  );
}

/**
 * Componente "inteligente" que maneja el estado del modal.
 */
export default function ReporteNutricionalDiaModal({
  open,
  onClose,
  data,
  isLoading,
  error,
  fecha,
  comensales,
  sucursalNombre
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      {/* Contenedor principal del modal */}
      <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 w-full max-w-6xl relative max-h-[90vh] overflow-y-auto">
        {/* Botón de Cierre Global (oculto en PDF) - Movido aquí, ahora es el único botón X */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-200 transition-colors print:hidden"
          title="Cerrar"
        >
          <X size={20} />
        </button>
        
        {/* Estados de Carga */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="mt-4 text-gray-600">Calculando reporte consolidado...</p>
          </div>
        )}
        {/* Estado de Error */}
        {error && (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <p className="text-red-600 text-lg font-semibold">{error}</p>
          </div>
        )}
        {/* Contenido Exitoso */}
        {data && !isLoading && (
          <ReporteContenido 
            data={data} 
            fecha={fecha} 
            comensales={comensales} 
            sucursalNombre={sucursalNombre}
            onClose={onClose} // Pasa la función onClose para el botón "Cerrar" interno
          />
        )}
      </div>
    </div>
  );
}