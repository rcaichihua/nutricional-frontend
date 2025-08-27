import { useEffect, useRef, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { useMenus } from "../hooks/useMenus";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Printer } from "lucide-react";

// Colores para el gráfico y resumen
const COLORS = ["#9effac", "#17405c", "#d0fdff"]; // Carbohidratos, Proteínas, Lípidos

// Estructura de campos igual a RecetaNutritionalDetail
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


export default function MenuNutritionalDetail({ menuId }) {
  const printRef = useRef();
  const { geValoresNutricionalesMenuById } = useMenus();

  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    if (!menuId) return;
    setLoading(true);
    setError(null);
    geValoresNutricionalesMenuById(menuId)
      .then((data) => setMenu(data))
      .catch((err) => setError(err.message || "Error al cargar el menu"))
      .finally(() => setLoading(false));
  }, [menuId]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!menu) return <div>No se encontró el menu</div>;


  // Pie chart data
  const dataChart = [
    { name: "Carbohidratos", value: menu.choCarbohidratoGTotal ?? 0 },
    {
      name: "Proteínas",
      value:
        menu.proteinaTotalG != null
          ? menu.proteinaTotalG
          : ((menu.proteinaAnimalGTotal ?? 0) + (menu.proteinaVegetalGTotal ?? 0)),
    },
    {
      name: "Lípidos",
      value:
        menu.grasaTotalG != null
          ? menu.grasaTotalG
          : ((menu.grasaAnimalGTotal ?? 0) + (menu.grasaVegetalGTotal ?? 0)),
    },
  ];

  // Calorías por macronutriente
  const kcalCarbs = (menu.choCarbohidratoGTotal ?? 0) * 4;
  const proteTotal = menu.proteinaTotalG != null
    ? menu.proteinaTotalG
    : ((menu.proteinaAnimalGTotal ?? 0) + (menu.proteinaVegetalGTotal ?? 0));
  const kcalProteinas = proteTotal * 4;
  const grasaTotal = menu.grasaTotalG != null
    ? menu.grasaTotalG
    : ((menu.grasaAnimalGTotal ?? 0) + (menu.grasaVegetalGTotal ?? 0));
  const kcalLipidos = grasaTotal * 9;
  const kcalTotal = menu.energiaKcalTotal ?? (kcalCarbs + kcalProteinas + kcalLipidos);

  // Porcentajes
  const percentCarbs = kcalTotal ? ((kcalCarbs * 100) / kcalTotal).toFixed(1) + "%" : "0%";
  const percentProteinas = kcalTotal ? ((kcalProteinas * 100) / kcalTotal).toFixed(1) + "%" : "0%";
  const percentLipidos = kcalTotal ? ((kcalLipidos * 100) / kcalTotal).toFixed(1) + "%" : "0%";

  const resumen = [
    {
      name: "Carbohidratos",
      color: COLORS[0],
      cantidad: `${menu.choCarbohidratoGTotal ?? 0} g`,
      kcal: kcalCarbs.toFixed(0),
      percent: percentCarbs,
    },
    {
      name: "Proteínas",
      color: COLORS[1],
      cantidad: `${proteTotal} g`,
      kcal: kcalProteinas.toFixed(0),
      percent: percentProteinas,
    },
    {
      name: "Lípidos",
      color: COLORS[2],
      cantidad: `${grasaTotal} g`,
      kcal: kcalLipidos.toFixed(0),
      percent: percentLipidos,
    },
  ];

  const handleDownloadPDF = async () => {
  if (printRef.current) {
    const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;
    // Si la imagen es más alta que la página, agrega páginas
    while (position < imgHeight) {
      pdf.addImage(imgData, "PNG", 0, -position, imgWidth, imgHeight);
      if (position + pageHeight < imgHeight) pdf.addPage();
      position += pageHeight;
    }
    pdf.save(`${menu?.nombre || 'menu'}-nutricional.pdf`);
  }
};

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-8" ref={printRef}>
      <div className="flex justify-end mb-4">
        <button
          className="p-2 text-yellow-500 hover:bg-blue-100 rounded-full print:hidden"
          onClick={handleDownloadPDF}
          title="Imprimir"
        >
          <Printer size={20} />
        </button>
      </div>
      {/* Encabezado menú */}
      <div className="mb-8 text-center">
        <b className="block text-xl">{menu.nombreMenu}</b>
        <div className="mt-2">
          {menu.nombresRecetas && menu.nombresRecetas.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {menu.nombresRecetas.map((receta, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-sm font-medium shadow-sm"
                >
                  {receta}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gráfico y tabla resumen */}
      <div className="flex flex-col md:flex-row gap-8 justify-between items-center mb-14">
        {/* Pie Chart */}
        <div className="flex-1 flex items-center justify-center">
          <PieChart width={230} height={180}>
            <Pie
              data={dataChart}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={55}
              dataKey="value"
              label={false}
            >
              {dataChart.map((entry, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </div>
        {/* Tabla de resumen con encabezados */}
        <div className="flex-1 flex flex-col gap-2 bg-cyan-500 text-white rounded-xl p-4 shadow-lg min-w-[260px]">
          <div className="text-lg font-semibold text-center mb-2">
            Calorías: {kcalTotal ? kcalTotal.toFixed(2) : "-"} cal
          </div>
          {/* Encabezados */}
          <div className="flex items-center gap-3 mb-2 font-bold border-b border-cyan-200 pb-1">
            <span className="w-4 h-4"></span>
            <span className="flex-1">Nutriente</span>
            <span className="w-16 text-center">Cantidad</span>
            <span className="w-16 text-center">kcal</span>
            <span className="w-16 text-center">% Energía</span>
          </div>
          {resumen.map((r) => (
            <div key={r.name} className="flex items-center gap-3 mb-1">
              <span
                className="w-4 h-4 rounded-sm"
                style={{ background: r.color }}
              ></span>
              <span className="flex-1">{r.name}</span>
              <span className="w-16 text-center">{r.cantidad}</span>
              <span className="w-16 text-center">{r.kcal} cal</span>
              <span className="w-16 text-center">{r.percent}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Vitaminas y Minerales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        {/* Vitaminas */}
        <div>
          <div className="flex justify-center">
            <div className="bg-red-500 text-white px-8 py-1 rounded-t-xl font-semibold mb-2">
              Vitaminas
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {VITAMINAS.filter(v => menu[v.key] !== undefined && menu[v.key] !== null).map((v) => (
              <div
                key={v.key}
                className="border px-2 py-1 rounded-lg text-center bg-white shadow"
              >
                {v.label}
                <br />
                <span className="text-xs font-semibold">{menu[v.key]} mg</span>
              </div>
            ))}
          </div>
        </div>
        {/* Minerales */}
        <div>
          <div className="flex justify-center">
            <div className="bg-yellow-400 text-white px-8 py-1 rounded-t-xl font-semibold mb-2">
              Minerales
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MINERALES.filter(m => menu[m.key] !== undefined && menu[m.key] !== null).map((m) => (
              <div
                key={m.key}
                className="border px-2 py-1 rounded-lg text-center bg-white shadow"
              >
                {m.label}
                <br />
                <span className="text-xs font-semibold">{menu[m.key]} mg</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Macronutrientes y Otros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
        {/* Macronutrientes */}
        <div>
          <div className="flex justify-center">
            <div className="bg-green-500 text-white px-8 py-1 rounded-t-xl font-semibold mb-2">
              Macronutrientes
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MACRONUTRIENTES.filter(l => menu[l.key] !== undefined && menu[l.key] !== null).map((l) => (
              <div
                key={l.key}
                className="border px-2 py-1 rounded-lg text-center bg-white shadow"
              >
                {l.label}
                <br />
                <span className="text-xs font-semibold">{menu[l.key]} g</span>
              </div>
            ))}
          </div>
        </div>
        {/* Otros */}
        <div>
          <div className="flex justify-center">
            <div className="bg-gray-400 text-white px-8 py-1 rounded-t-xl font-semibold mb-2">
              Otros
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {OTROS.filter(m => menu[m.key] !== undefined && menu[m.key] !== null).map((m) => (
              <div
                key={m.key}
                className="border px-2 py-1 rounded-lg text-center bg-white shadow"
              >
                {m.label}
                <br />
                <span className="text-xs font-semibold">{menu[m.key]} g</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
