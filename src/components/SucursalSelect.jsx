// src/components/SucursalSelect.jsx
import { useSucursales } from "../hooks/useSucursales";

export default function SucursalSelect({ className = "", label = "Comedor" }) {
  const { sucursales, selectedId, select } = useSucursales();

  if (!sucursales.length) return null;

  return (
    <label className={className} style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
      <span>{label}:</span>
      <select
        value={selectedId ?? ""}
        onChange={(e) => select(Number(e.target.value))}
      >
        {sucursales.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}
