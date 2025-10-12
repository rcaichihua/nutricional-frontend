// src/hooks/useSucursales.jsx
import { useContext } from 'react';
import { SucursalContext } from '../context/SucursalContext'; // Apunta al nuevo archivo

export function useSucursales() {
  const context = useContext(SucursalContext);
  if (context === undefined) {
    throw new Error('useSucursales debe ser usado dentro de un SucursalProvider');
  }
  return context;
}