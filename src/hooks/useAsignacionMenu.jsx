// src/hooks/useAsignacionMenu.jsx
import { useCallback, useEffect, useState } from "react";
import {
  crearAsignacionMenu as apiCrear,
  //getAsignacionMenus as apiList,
  eliminarAsignacionMenu as apiDelete,
  getAsignacionMenus,
} from "../api/menus";

export function useAsignacionMenu() {
  const [asignacionMenu, setAsignacionMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolveSucursalId = (options) => {
    const sidFromOpt = options?.sucursalId;
    const sidFromStorage = localStorage.getItem("sucursalId");
    return sidFromOpt ?? (sidFromStorage ? Number(sidFromStorage) : undefined);
  };

  /*const normalize = (raw) =>
    (raw || []).map((a) => ({
      ...a,
      // Si viene "2025-09-22T00:00:00", me quedo con "2025-09-22"
      fechaAsignacion:
        typeof a.fechaAsignacion === "string"
          ? a.fechaAsignacion.slice(0, 10)
          : a.fechaAsignacion,
    }));*/

  const fetchAsignacionMenus = useCallback(async (options) => {
    setLoading(true);
    setError(null);
    try {
      const sucursalId = resolveSucursalId(options);
      const data = await getAsignacionMenus({ sucursalId });

      //console.log(`[DEBUG] Respuesta de la API para sucursal ${sucursalId}:`, data);

      // 👇 NORMALIZA: fuerza 'YYYY-MM-DD' para que el filtro semanal funcione
      const sane = (Array.isArray(data) ? data : []).map((a) => ({
        ...a,
        fechaAsignacion:
          typeof a.fechaAsignacion === "string"
            ? a.fechaAsignacion.slice(0, 10) // "2025-09-22T00:00:00" -> "2025-09-22"
            : a.fechaAsignacion,
      }));

      setAsignacionMenu(sane);
      return sane;
    } catch (err) {
      setError(err?.message || "Error al cargar asignaciones de menú");
      setAsignacionMenu([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  const createAsignacionMenu = useCallback(
    async (dto, onSuccess, options) => {
      setLoading(true);
      setError(null);
      try {
        const sucursalId = resolveSucursalId(options);
        await apiCrear(dto, { sucursalId });
        await fetchAsignacionMenus({ sucursalId }); // 👈 refresco único (normaliza)
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
        await apiDelete(asignacionMenuId, { sucursalId });
        await fetchAsignacionMenus({ sucursalId }); // 👈 refresco único (normaliza)
        return true;
      } catch (err) {
        setError(err?.message || "Error al eliminar la asignación de menú");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchAsignacionMenus]
  );

  useEffect(() => {
    fetchAsignacionMenus(); // primera carga (si hay sucursal en storage)
  }, [fetchAsignacionMenus]);

  return {
    asignacionMenu,
    loading,
    error,
    fetchAsignacionMenus,
    createAsignacionMenu,
    deleteAsignacionMenu,
  };
}
