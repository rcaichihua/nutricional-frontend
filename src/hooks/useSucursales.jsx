// src/hooks/useSucursales.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuth } from "../api/auth"; // tu auth.ts ya expone getAuth()

export function useSucursales() {
  const [sucursales, setSucursales] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // Carga inicial desde localStorage
  useEffect(() => {
    const auth = getAuth();
    if (auth && Array.isArray(auth.sucursales)) {
      setSucursales(auth.sucursales);
    }
    const saved = localStorage.getItem("sucursalId");
    setSelectedId(saved ? Number(saved) : auth?.defaultSucursalId ?? null);
  }, []);

  // Cambiar selección y persistir
  const select = useCallback((id) => {
    setSelectedId(id);
    localStorage.setItem("sucursalId", String(id));
    // Avísale al resto de la app (opcional)
    window.dispatchEvent(new CustomEvent("sucursal:changed", { detail: id }));
  }, []);

  const selected = useMemo(
    () => sucursales.find((s) => s.id === selectedId) || null,
    [sucursales, selectedId]
  );

  return { sucursales, selectedId, selected, select };
}
