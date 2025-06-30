import { ArrowUpRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from "recharts";

// Colores morados
const COLOR_ANTES = "#c084fc";   // Morado claro
const COLOR_DESPUES = "#a21caf"; // Morado oscuro

const NUTRIENTES = [
  { key: "energia_kcal", label: "Energía (kcal)", unidad: "kcal" },
  { key: "proteina_g", label: "Proteína total (g)", unidad: "g" },
  { key: "lipidos_g", label: "Grasa total (g)", unidad: "g" },
  { key: "carbohidratos_g", label: "Carbohidratos (g)", unidad: "g" },
  { key: "calcio_mg", label: "Calcio (mg)", unidad: "mg" },
  { key: "hierro_mg", label: "Hierro (mg)", unidad: "mg" },
  { key: "vitamina_c_mg", label: "Vitamina C (mg)", unidad: "mg" },
];

// Datos duros
const DATOS_ANTES = {
  energia_kcal: 868.3,
  proteina_g: 546.95,
  lipidos_g: 30.8,
  carbohidratos_g: 127.68,
  calcio_mg: 142.01,
  hierro_mg: 5.48,
  vitamina_c_mg: 2.54,
};
const DATOS_DESPUES = {
  energia_kcal: 909.03,
  proteina_g: 605.83,
  lipidos_g: 34.8,
  carbohidratos_g: 131.1,
  calcio_mg: 156.51,
  hierro_mg: 6.56,
  vitamina_c_mg: 2.94,
};

// Calcular incrementos
const DATA_BARRAS = NUTRIENTES.map(n => ({
  nutriente: n.label,
  antes: DATOS_ANTES[n.key],
  despues: DATOS_DESPUES[n.key],
}));
const INCREMENTOS = NUTRIENTES.map(n => ({
  nutriente: n.label,
  incremento: DATOS_ANTES[n.key]
    ? (((DATOS_DESPUES[n.key] - DATOS_ANTES[n.key]) / DATOS_ANTES[n.key]) * 100).toFixed(1)
    : "0"
}));

function getIncremento(key) {
  const antes = DATOS_ANTES[key];
  const despues = DATOS_DESPUES[key];
  if (!antes) return 0;
  return ((despues - antes) / antes * 100).toFixed(1);
}

// Tooltip personalizado en morado
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const antes = payload.find(p => p.dataKey === "antes");
  const despues = payload.find(p => p.dataKey === "despues");
  return (
    <div
      className="rounded-xl shadow-xl border px-4 py-2"
      style={{
        minWidth: 170,
        background: "#fff",
        borderColor: COLOR_DESPUES
      }}
    >
      <div className="font-bold mb-2 text-black">{label}</div>
      <div className="font-semibold" style={{ color: COLOR_ANTES }}>
        Antes: {antes ? antes.value : "--"}
      </div>
      <div className="font-semibold" style={{ color: COLOR_DESPUES }}>
        Después: {despues ? despues.value : "--"}
      </div>
    </div>
  );
}

export default function ComparativoNutricionalLocro() {
  return (
    <section className="w-full max-w-4xl mx-auto my-10">
      <h2 className="text-2xl font-bold mb-8 text-purple-800 flex items-center gap-2">
        <ArrowUpRight className="text-purple-600" /> Comparativo nutricional: Locro de zapallo
      </h2>
      <div className="bg-white rounded-2xl shadow-xl border p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4 text-purple-700">Antes de la mejora</h3>
          <ul className="space-y-2">
            {NUTRIENTES.map(n => (
              <li key={n.key} className="flex justify-between text-gray-700">
                <span>{n.label}:</span>
                <span className="font-bold">{DATOS_ANTES[n.key]} <span className="text-gray-400 text-sm">{n.unidad}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4 text-purple-700">Después de la mejora</h3>
          <ul className="space-y-2">
            {NUTRIENTES.map(n => (
              <li key={n.key} className="flex justify-between text-gray-700">
                <span>{n.label}:</span>
                <span className="font-bold">{DATOS_DESPUES[n.key]} <span className="text-gray-400 text-sm">{n.unidad}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tabla de incrementos porcentuales */}
      <div className="bg-purple-50 rounded-2xl shadow mt-8 p-6">
        <h4 className="text-lg font-semibold text-purple-700 mb-4">Incremento porcentual por nutriente</h4>
        <table className="w-full text-sm md:text-base">
          <thead>
            <tr className="text-purple-800 border-b">
              <th className="p-2 text-left">Nutriente</th>
              <th className="p-2">Antes</th>
              <th className="p-2">Después</th>
              <th className="p-2">Incremento (%)</th>
            </tr>
          </thead>
          <tbody>
            {NUTRIENTES.map(n => {
              const incremento = getIncremento(n.key);
              return (
                <tr key={n.key} className="border-b last:border-0">
                  <td className="p-2">{n.label}</td>
                  <td className="p-2 text-center">{DATOS_ANTES[n.key]}</td>
                  <td className="p-2 text-center">{DATOS_DESPUES[n.key]}</td>
                  <td className={`p-2 text-center font-bold ${incremento > 0 ? 'text-purple-600' : 'text-gray-600'}`}>
                    {incremento > 0 ? `+${incremento}%` : `${incremento}%`}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Gráfico de barras */}
      <div className="my-10">
        <h3 className="text-lg font-semibold mb-2 text-purple-700">Gráfico de comparación de nutrientes</h3>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={DATA_BARRAS}
            margin={{ top: 32, right: 30, left: 0, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nutriente" angle={-20} textAnchor="end" interval={0} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="antes" fill={COLOR_ANTES} name="Antes">
              <LabelList dataKey="antes" position="top" formatter={v => v} />
            </Bar>
            <Bar dataKey="despues" fill={COLOR_DESPUES} name="Después">
              <LabelList
                dataKey="despues"
                position="top"
                formatter={(v, entry) => {
                  if (!entry || !entry.nutriente || v == null) return "";
                  const incrementoObj = INCREMENTOS.find(inc => inc.nutriente === entry.nutriente);
                  return incrementoObj ? `${v} (+${incrementoObj.incremento}%)` : v;
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Nota interpretativa */}
      <div className="mt-8 p-6 bg-purple-50 rounded-2xl shadow text-purple-900">
        <h3 className="text-lg font-semibold mb-2">Interpretación / Nota para donantes:</h3>
        <p>
          Gracias a la donación realizada por la comunidad, el menú "Locro de zapallo" muestra una mejora nutricional significativa en todos los parámetros analizados.<br />
          En términos generales, la energía total del plato aumentó en <span className="font-semibold text-purple-700">4.7%</span>, la proteína total en <span className="font-semibold text-purple-700">10.8%</span>, la grasa en <span className="font-semibold text-purple-700">13.0%</span>, el calcio en <span className="font-semibold text-purple-700">10.2%</span>, el hierro en <span className="font-semibold text-purple-700">19.7%</span> y la vitamina C en <span className="font-semibold text-purple-700">15.7%</span>.<br />
          Este incremento fortalece el aporte nutricional del almuerzo, ayudando a mejorar la alimentación y la salud de los beneficiarios. Así se cumple el objetivo de optimizar la calidad de los menús servidos gracias a la solidaridad recibida.
        </p>
      </div>
    </section>
  );
}
