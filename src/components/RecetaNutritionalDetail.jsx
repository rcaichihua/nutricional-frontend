import { useEffect, useState } from "react";
import { useRecetas } from "../hooks/useRecetas";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { COLORSCHART } from "../config/constants";

// 🧈 Macronutrientes
const MACRONUTRIENTES = [
  { label: "Energía (kcal)", key: "energiaKcalTotal" },
  { label: "Agua", key: "aguaGTotal" },
  { label: "Proteína animal", key: "proteinaAnimalGTotal" },
  { label: "Proteína vegetal", key: "proteinaVegetalGTotal" },
  { label: "Proteína total", key: "proteinaTotalG" },
  { label: "Grasa animal", key: "grasaAnimalGTotal" },
  { label: "Grasa vegetal", key: "grasaVegetalGTotal" },
  { label: "Grasa total", key: "grasaTotalG" },
  { label: "Carbohidratos", key: "choCarbohidratoGTotal" },
  { label: "Fibra", key: "fibraGTotal" },
];

// 🧪 Vitaminas (Micronutrientes)
const VITAMINAS = [
  { label: "Vitamina A (Retinol)", key: "retinolMcgTotal" },
  { label: "Vitamina B1 (Tiamina)", key: "vitaminaB1TiaminaMgTotal" },
  { label: "Vitamina B2 (Riboflavina)", key: "vitaminaB2RiboflavinaMgTotal" },
  { label: "Vitamina B3 (Niacina)", key: "niacinaMgTotal" },
  { label: "Vitamina C", key: "vitaminaCMgTotal" },
];

// 🧲 Minerales (Micronutrientes)
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

// ⚗️ Compuestos especiales
const COMPUESTOS_ESPECIALES = [
  { label: "Nitrógeno animal", key: "nitrogenoAnimalGTotal" },
  { label: "Nitrógeno vegetal", key: "nitrogenoVegetalGTotal" },
];

export default function RecetaNutritionalDetail({ id }) {
  const { getRecetaConInsumoById } = useRecetas();

  const [receta, setReceta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    getRecetaConInsumoById(id)
      .then((data) => setReceta(data))
      .catch((err) => setError(err.message || "Error al cargar la receta"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!receta) return <div>No se encontró la receta</div>;

  // Construir dataChart dinámicamente
  const dataChart = [
    { name: "Carbohidratos", value: receta.choCarbohidratoGTotal ?? 0 },
    {
      name: "Proteínas",
      value:
        receta.proteinaTotalG ??
        receta.proteinaAnimalGTotal + receta.proteinaVegetalGTotal ??
        0,
    },
    {
      name: "Lípidos",
      value:
        receta.grasaTotalG ??
        receta.grasaAnimalGTotal + receta.grasaVegetalGTotal ??
        0,
    },
  ];

  // Construir resumen dinámicamente
  const resumen = [
    {
      name: "Carbohidratos",
      color: COLORSCHART[0],
      cantidad: `${receta.choCarbohidratoGTotal ?? 0} g`,
      kcal: ((receta.choCarbohidratoGTotal ?? 0) * 4).toFixed(0),
      percent: receta.energiaKcalTotal
        ? (
            ((receta.choCarbohidratoGTotal ?? 0) * 4 * 100) /
            receta.energiaKcalTotal
          ).toFixed(1) + "%"
        : "0%",
    },
    {
      name: "Proteínas",
      color: COLORSCHART[1],
      cantidad: `${
        receta.proteinaTotalG ??
        receta.proteinaAnimalGTotal + receta.proteinaVegetalGTotal ??
        0
      } g`,
      kcal: (
        (receta.proteinaTotalG ??
          receta.proteinaAnimalGTotal + receta.proteinaVegetalGTotal ??
          0) * 4
      ).toFixed(0),
      percent: receta.energiaKcalTotal
        ? (
            ((receta.proteinaTotalG ??
              receta.proteinaAnimalGTotal + receta.proteinaVegetalGTotal ??
              0) *
              4 *
              100) /
            receta.energiaKcalTotal
          ).toFixed(1) + "%"
        : "0%",
    },
    {
      name: "Lípidos",
      color: COLORSCHART[2],
      cantidad: `${
        receta.grasaTotalG ??
        receta.grasaAnimalGTotal + receta.grasaVegetalGTotal ??
        0
      } g`,
      kcal: (
        (receta.grasaTotalG ??
          receta.grasaAnimalGTotal + receta.grasaVegetalGTotal ??
          0) * 9
      ).toFixed(0),
      percent: receta.energiaKcalTotal
        ? (
            ((receta.grasaTotalG ??
              receta.grasaAnimalGTotal + receta.grasaVegetalGTotal ??
              0) *
              9 *
              100) /
            receta.energiaKcalTotal
          ).toFixed(1) + "%"
        : "0%",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
      {/* Encabezado menú */}
      <div className="mb-8 text-center">
        <b className="block text-xl">{receta.nombre}</b>
        <div className="mt-2">
          <span className="underline">Insumos</span>:
          {receta.insumos && receta.insumos.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {receta.insumos.map((insumo) => (
                <span
                  key={insumo.insumoId}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-sm font-medium shadow-sm"
                >
                  {insumo.nombreInsumo}
                  {insumo.cantidad !== undefined && (
                    <span className="ml-1 text-gray-700 font-semibold">
                      ({insumo.cantidad}
                      {insumo.unidadMedida ? ` ${insumo.unidadMedida}` : ""})
                    </span>
                  )}
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
                <Cell key={i} fill={COLORSCHART[i]} />
              ))}
            </Pie>
          </PieChart>
        </div>
        {/* Tabla de resumen con estilos antiguos pero encabezados */}
        <div className="flex-1 flex flex-col gap-2 bg-cyan-500 text-white rounded-xl p-4 shadow-lg min-w-[260px]">
          <div className="text-lg font-semibold text-center mb-2">
            Calorías: {receta.energiaKcalTotal ?? 0} cal
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
            {VITAMINAS.filter(v => receta[v.key] !== undefined && receta[v.key] !== null).map((v) => (
              <div
                key={v.key}
                className="border px-2 py-1 rounded-lg text-center bg-white shadow"
              >
                {v.label}
                <br />
                <span className="text-xs font-semibold">{receta[v.key]} mg</span>
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
            {MINERALES.filter(m => receta[m.key] !== undefined && receta[m.key] !== null).map((m) => (
              <div
                key={m.key}
                className="border px-2 py-1 rounded-lg text-center bg-white shadow"
              >
                {m.label}
                <br />
                <span className="text-xs font-semibold">{receta[m.key]} mg</span>
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
            {MACRONUTRIENTES.filter(l => receta[l.key] !== undefined && receta[l.key] !== null).map((l) => (
              <div
                key={l.key}
                className="border px-2 py-1 rounded-lg text-center bg-white shadow"
              >
                {l.label}
                <br />
                <span className="text-xs font-semibold">{receta[l.key]} g</span>
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
            {COMPUESTOS_ESPECIALES.filter(m => receta[m.key] !== undefined && receta[m.key] !== null).map((m) => (
              <div
                key={m.key}
                className="border px-2 py-1 rounded-lg text-center bg-white shadow"
              >
                {m.label}
                <br />
                <span className="text-xs font-semibold">{receta[m.key]} mg</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
