import { useEffect, useState } from "react";
import { useRecetas } from "../hooks/useRecetas";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { COLORSCHART } from "../config/constants";

const menuHeader = {
  titulo: "Menú 3:",
  sopa: "Sopa de verduras",
  proteica: "Ración proteica: saltado de vainitas con pollo",
  guarnicion: "Guarnición: Frejoles, arroz",
  infu: "Anís (sin azúcar)",
  fruta: "Mandarina",
};

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
        <b className="block text-xl">{menuHeader.titulo}</b>
        <div className="text-lg font-medium">{menuHeader.sopa}</div>
        <div className="text-gray-700 mt-1">
          {menuHeader.proteica} / {menuHeader.guarnicion}
        </div>
        <div className="mt-2">
          <span className="underline">Infusión</span>: {menuHeader.infu}{" "}
          <b>/</b> <span className="underline">Fruta</span>: {menuHeader.fruta}
        </div>
      </div>

      {/* Gráfico y tabla resumen */}
      <div className="flex flex-col md:flex-row gap-8 justify-between items-center mb-8">
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
        {/* Tabla de resumen */}
        <div className="flex-1 flex flex-col gap-2 bg-cyan-500 text-white rounded-xl p-4 shadow-lg min-w-[260px]">
          <div className="text-lg font-semibold text-center mb-2">
            Calorías: {receta.energiaKcalTotal ?? 0} cal
          </div>
          {resumen.map((r) => (
            <div key={r.name} className="flex items-center gap-3 mb-1">
              <span
                className="w-4 h-4 rounded-sm"
                style={{ background: r.color }}
              ></span>
              <span className="flex-1">{r.name}</span>
              <span className="w-20">{r.cantidad}</span>
              <span className="w-16">{r.kcal} cal</span>
              <span>{r.percent}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
