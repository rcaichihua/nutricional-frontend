// src/hooks/useAsignacionMenu.jsx
import { useCallback, useEffect, useState } from "react";
import {
  crearAsignacionMenu,
  getAsignacionMenus,
  eliminarAsignacionMenu,
} from "../api/menus";

/**
 * Todas las funciones aceptan un options opcional: { sucursalId?: number|string }
 * Si no viene, se toma de localStorage ("sucursalId").
 * Asegúrate de que en ../api/menus las funciones acepten ese options
 * y envíen sucursalId (encabezado X-Sucursal-Id o query ?sucursalId=...).
 */
export function useAsignacionMenu() {
  const [asignacionMenu, setAsignacionMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolveSucursalId = (options) => {
    const sidFromOpt = options?.sucursalId;
    const sidFromStorage = localStorage.getItem("sucursalId");
    return sidFromOpt ?? (sidFromStorage ? Number(sidFromStorage) : undefined);
  };

  const fetchAsignacionMenus = useCallback(async (options) => {
    setLoading(true);
    setError(null);
    try {
      const sucursalId = resolveSucursalId(options);
      const data = await getAsignacionMenus({ sucursalId });
      setAsignacionMenu(data);
    } catch (err) {
      setError(err?.message || "Error al cargar asignaciones de menú");
    } finally {
      setLoading(false);
    }
  }, []);

  const createAsignacionMenu = useCallback(
    async (asignacion, onSuccess, options) => {
      setLoading(true);
      setError(null);
      try {
        const sucursalId = resolveSucursalId(options);
        await crearAsignacionMenu(asignacion, { sucursalId });
        await fetchAsignacionMenus({ sucursalId }); // recarga con la misma sucursal
        onSuccess?.();
        return true;
      } catch (err) {
        setError(err?.message || "Error al crear la asignación de menú");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchAsignacionMenus]
  );

  const deleteAsignacionMenu = useCallback(
    async (asignacionMenuId, options) => {
      setLoading(true);
      setError(null);
      try {
        const sucursalId = resolveSucursalId(options);
        await eliminarAsignacionMenu(asignacionMenuId, { sucursalId });
        // UI optimista: quitamos localmente; luego puedes forzar refetch si prefieres.
        setAsignacionMenu((prev) =>
          prev.filter((asig) => asig.asignacionMenuId !== asignacionMenuId)
        );
        return true;
      } catch (err) {
        setError(err?.message || "Error al eliminar la asignación de menú");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // primera carga con la sucursal del localStorage (si existe)
    fetchAsignacionMenus();
  }, [fetchAsignacionMenus]);

  return {
    asignacionMenu,
    loading,
    error,
    fetchAsignacionMenus,     // (options?: {sucursalId})
    createAsignacionMenu,     // (dto, onSuccess?, options?: {sucursalId})
    deleteAsignacionMenu,     // (id, options?: {sucursalId})
  };
}
