import { useEffect, useState, useCallback } from "react";
import {
  getMenus,
  crearMenu,
  editarMenu,
  getMenuValoresNutricionalesById,
} from "../api/menus";

export function useMenus() {
  // Estados para listar menus
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para operaciones CRUD
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationError, setOperationError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Función para obtener menus
  const fetchMenus = useCallback(() => {
    setLoading(true);
    setError(null);
    getMenus()
      .then(setMenus)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  // Validaciones centralizadas
  const validateReceta = (receta) => {
    const errors = [];
    if (!receta.nombre?.trim()) {
      errors.push("Debes poner el nombre de la receta");
    }
    if (receta.porciones !== undefined && receta.porciones < 1) {
      errors.push("La receta debe tener al menos 1 porción");
    }
    return errors;
  };

  // Crear Menu
  const createMenu = async (menu, onSuccess) => {
    setOperationLoading(true);
    setOperationError(null);
    setSuccessMessage(null);
    try {
      const validationErrors = validateReceta(menu);
      if (validationErrors.length > 0) {
        setOperationError(validationErrors.join(", "));
        return false;
      }
      await crearMenu(menu);
      setSuccessMessage("Receta creada exitosamente");
      fetchMenus();
      onSuccess?.();
      return true;
    } catch (err) {
      setOperationError(err.message || "Error al crear la receta");
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  // Editar menu
  const updateMenu = async (menu, onSuccess) => {
    setOperationLoading(true);
    setOperationError(null);
    setSuccessMessage(null);
    try {
      const validationErrors = validateReceta(menu);
      if (validationErrors.length > 0) {
        setOperationError(validationErrors.join(", "));
        return false;
      }
      await editarMenu(menu);
      setSuccessMessage("Receta actualizada exitosamente");
      fetchMenus();
      onSuccess?.();
      return true;
    } catch (err) {
      setOperationError(err.message || "Error al editar la receta");
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  // Guardar (crear o editar)
  const saveMenu = async (receta, onSuccess) => {
    if (receta.menuId) {
      return await updateMenu(receta, onSuccess);
    } else {
      return await createMenu(receta, onSuccess);
    }
  };

  // Obtener Menu con sus valores nutricionales por receta
  const geValoresNutricionalesMenuById = (id) => getMenuValoresNutricionalesById(id);

  // Limpiar mensajes
  const clearMessages = () => {
    setOperationError(null);
    setSuccessMessage(null);
  };

  // Hook para obtener el menú nutricional
  const getNutricionalMenu = useCallback((detalleMenuId) => {
    setLoading(true);
    setError(null);
    return getMenus(detalleMenuId)
      .then((data) => {
        setMenus(data);
        return data;
      })
      .catch((err) => {
        setError(err.message || "Error al cargar el menú");
        throw err;
      })
      .finally(() => setLoading(false));
  }, []);

  // Cargar menus al montar el componente
  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  return {
    // Estados para listar
    menus,
    loading,
    error,
    refetch: fetchMenus,

    // Estados para operaciones
    operationLoading,
    operationError,
    successMessage,

    // Funciones CRUD
    createMenu,
    updateMenu,
    saveMenu,
    clearMessages,

    // Menu nutricional
    getNutricionalMenu,

    // Extra
    geValoresNutricionalesMenuById,
  };
}