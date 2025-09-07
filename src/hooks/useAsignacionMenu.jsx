import { useCallback, useEffect, useState } from "react";
import { crearAsignacionMenu, getAsignacionMenus, eliminarAsignacionMenu } from "../api/menus"; // Se importa la nueva función

export function useAsignacionMenu() {
  const [asignacionMenu, setAsignacionMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAsignacionMenus = useCallback(() => {
    setLoading(true);
    setError(null);
    getAsignacionMenus()
      .then(setAsignacionMenu)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const createAsignacionMenu = async (asignacion, onSuccess) => {
    setLoading(true);
    setError(null);
    try {
      await crearAsignacionMenu(asignacion);
      setLoading(false);
      fetchAsignacionMenus();
      onSuccess?.();
      return true;
    } catch (err) {
      setError(err.message || "Error al crear la asignación de menú");
      setLoading(false);
      return false;
    }
  };

  // --- NUEVA FUNCIÓN PARA ELIMINAR ---
  const deleteAsignacionMenu = async (asignacionMenuId) => {
    setLoading(true);
    setError(null);
    try {
      await eliminarAsignacionMenu(asignacionMenuId);
      // Actualiza el estado local para reflejar el cambio instantáneamente (UI optimista)
      setAsignacionMenu(prev => prev.filter(asig => asig.asignacionMenuId !== asignacionMenuId));
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message || "Error al eliminar la asignación de menú");
      setLoading(false);
      return false;
    }
  };
  // --- FIN DE LA NUEVA FUNCIÓN ---

  useEffect(() => {
    fetchAsignacionMenus();
  }, [fetchAsignacionMenus]);

  return {
    asignacionMenu,
    loading,
    error,
    fetchAsignacionMenus,
    createAsignacionMenu,
    deleteAsignacionMenu, // Se exporta la nueva función
  };
}