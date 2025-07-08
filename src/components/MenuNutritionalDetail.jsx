import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// Colores de cada nutriente
const COLORS = ["#9effac", "#17405c", "#d0fdff"]; // Carbohidratos, Proteínas, Lípidos

// Datos del gráfico y resumen (ejemplo)
const dataChart = [
  { name: "Carbohidratos", value: 420 },
  { name: "Proteínas", value: 284 },
  { name: "Lípidos", value: 234 },
];

const resumen = [
  {
    name: "Carbohidratos",
    cantidad: "105 g",
    kcal: 420,
    percent: "45 %",
    color: COLORS[0],
  },
  {
    name: "Proteínas",
    cantidad: "71 g",
    kcal: 284,
    percent: "30 %",
    color: COLORS[1],
  },
  {
    name: "Lípidos",
    cantidad: "26 g",
    kcal: 234,
    percent: "25 %",
    color: COLORS[2],
  },
];

// Valores duros de vitaminas, lípidos, minerales, otros:
const VITAMINAS = [
  { nombre: "A", valor: "876 mcg" },
  { nombre: "B1", valor: "1 mg" },
  { nombre: "B2", valor: "1 mg" },
  { nombre: "B3", valor: "29 mg" },
  { nombre: "B5", valor: "4 mg" },
  { nombre: "B6", valor: "1 mg" },
  { nombre: "B9", valor: "423 mcg" },
  { nombre: "B12", valor: "3 mcg" },
  { nombre: "C", valor: "53 mg" },
  { nombre: "D", valor: "9 mcg" },
  { nombre: "E", valor: "3 mg" },
  { nombre: "VK", valor: "45 mcg" },
];
const OTROS = [
  { nombre: "Agua", valor: "591 ml" },
  { nombre: "Azúcar", valor: "15 g" },
  { nombre: "Fibra", valor: "7 g" },
  { nombre: "Alcohol", valor: "0 ml / 0 cal" },
];
const LIPIDOS = [
  { nombre: "Vit. E", valor: "3 mg" },
  { nombre: "Vit. K", valor: "45 mcg" },
  { nombre: "Colesterol", valor: "255 mg" },
  { nombre: "A.G. Monoinsaturados", valor: "7 g" },
  { nombre: "A.G. Poliinsaturados", valor: "10 g" },
  { nombre: "A.G. Saturados", valor: "5 g" },
];
const MINERALES = [
  { nombre: "Ca", valor: "150 mg" },
  { nombre: "P", valor: "680 mg" },
  { nombre: "Fe", valor: "10 mg" },
  { nombre: "Mg", valor: "140 mg" },
  { nombre: "K", valor: "1424 mg" },
  { nombre: "Se", valor: "78 mcg" },
  { nombre: "Na", valor: "413 mg" },
  { nombre: "Zn", valor: "5 mg" },
];

// ENCABEZADO DE EJEMPLO:
const menuHeader = {
  titulo: "Menú 3:",
  sopa: "Sopa de verduras",
  proteica: "Ración proteica: saltado de vainitas con pollo",
  guarnicion: "Guarnición: Frejoles, arroz",
  infu: "Anís (sin azúcar)",
  fruta: "Mandarina",
};

export default function MenuNutritionalDetail() {
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
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </div>
        {/* Tabla de resumen */}
        <div className="flex-1 flex flex-col gap-2 bg-cyan-500 text-white rounded-xl p-4 shadow-lg min-w-[260px]">
          <div className="text-lg font-semibold text-center mb-2">
            Calorías: 938 cal
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

      {/* Vitaminas y Otros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
        {/* Vitaminas */}
        <div>
          <div className="flex justify-center">
            <div className="bg-red-500 text-white px-8 py-1 rounded-t-xl font-semibold mb-0">
              Vitaminas
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {VITAMINAS.map((v) => (
              <div
                key={v.nombre}
                className="border px-2 py-1 rounded-lg text-center bg-white shadow"
              >
                {v.nombre}
                <br />
                <span className="text-xs">{v.valor}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Otros */}
        <div>
          <div className="flex justify-center">
            <div className="bg-cyan-500 text-white px-8 py-1 rounded-t-xl font-semibold mb-0">
              Otros
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {OTROS.map((o) => (
              <div
                key={o.nombre}
                className="border px-2 py-1 rounded-lg text-center bg-white shadow"
              >
                {o.nombre}
                <br />
                <span className="text-xs">{o.valor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lípidos y Minerales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Lípidos */}
        <div>
          <div className="flex justify-center">
            <div className="bg-gray-500 text-white px-8 py-1 rounded-t-xl font-semibold mb-0">
              Lípidos
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {LIPIDOS.map((l) => (
              <div
                key={l.nombre}
                className="border px-2 py-1 rounded-lg text-center bg-white shadow"
              >
                {l.nombre}
                <br />
                <span className="text-xs">{l.valor}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Minerales */}
        <div>
          <div className="flex justify-center">
            <div className="bg-gray-800 text-white px-8 py-1 rounded-t-xl font-semibold mb-0">
              Minerales
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MINERALES.map((m) => (
              <div
                key={m.nombre}
                className="border px-2 py-1 rounded-lg text-center bg-white shadow"
              >
                {m.nombre}
                <br />
                <span className="text-xs">{m.valor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
