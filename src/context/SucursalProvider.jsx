// src/context/SucursalProvider.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAuth } from '../api/auth';
import { SucursalContext } from './SucursalContext'; // Importamos el Context del otro archivo

// Este es el componente que SÍ exportamos por defecto
export default function SucursalProvider({ children }) {
  const [sucursales, setSucursales] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    if (auth && Array.isArray(auth.sucursales)) {
      setSucursales(auth.sucursales);
    }
    const saved = localStorage.getItem("sucursalId");
    setSelectedId(saved ? Number(saved) : auth?.defaultSucursalId ?? null);
  }, []);

  const select = useCallback((id) => {
    if (id) {
        setSelectedId(id);
        localStorage.setItem("sucursalId", String(id));
    }
  }, []);

  const value = useMemo(
    () => ({
      sucursales,
      selectedId,
      select,
      selected: sucursales.find((s) => s.id === selectedId) || null,
    }),
    [sucursales, selectedId, select]
  );

  return (
    <SucursalContext.Provider value={value}>
      {children}
    </SucursalContext.Provider>
  );
}