import { useCallback, useEffect, useState } from "react";
import { crearAsignacionMenu, getAsignacionMenus } from "../api/menus";

export function useAsignacionMenu() {
  const [asignacionMenu, setAsignacionMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener las asignaciones de menus
  const fetchAsignacionMenus = useCallback(() => {
    setLoading(true);
    setError(null);
    getAsignacionMenus()
      .then(setAsignacionMenu)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  // Crear Asignación de menus
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

  // Cargar Asignaciones de menus al montar el componente
    useEffect(() => {
      fetchAsignacionMenus();
    }, [fetchAsignacionMenus]);

  return {
      asignacionMenu,
      loading,
      error,
      fetchAsignacionMenus,
      createAsignacionMenu
  };
}
