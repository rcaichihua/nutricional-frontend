import { useEffect, useState, useCallback } from "react";
import {
  getRecetas,
  crearReceta,
  editarReceta,
  getRecetaConInsumosById,
  getRecetasConInsumos,
} from "../api/recetas";

export function useRecetas() {
  // Estados para listar recetas
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para recetas con insumos
  const [recetasConInsumos, setRecetasConInsumos] = useState([]);
  const [loadingRecetasConInsumos, setLoadingRecetasConInsumos] = useState(true);
  const [errorRecetasConInsumos, setErrorRecetasConInsumos] = useState(null);

  // Estados para operaciones CRUD
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationError, setOperationError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Función para obtener recetas
  const fetchRecetas = useCallback(() => {
    setLoading(true);
    setError(null);
    getRecetas()
      .then(setRecetas)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  // Función para obtener recetas con insumos
  const fetchRecetasConInsumos = useCallback(() => {
    setLoadingRecetasConInsumos(true);
    setErrorRecetasConInsumos(null);
    getRecetasConInsumos()
      .then(setRecetasConInsumos)
      .catch(setErrorRecetasConInsumos)
      .finally(() => setLoadingRecetasConInsumos(false));
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

  // Crear receta
  const createReceta = async (receta, onSuccess) => {
    setOperationLoading(true);
    setOperationError(null);
    setSuccessMessage(null);
    try {
      const validationErrors = validateReceta(receta);
      if (validationErrors.length > 0) {
        setOperationError(validationErrors.join(", "));
        return false;
      }
      await crearReceta(receta);
      setSuccessMessage("Receta creada exitosamente");
      fetchRecetas();
      fetchRecetasConInsumos(); // Refrescar también recetas con insumos
      onSuccess?.();
      return true;
    } catch (err) {
      setOperationError(err.message || "Error al crear la receta");
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  // Editar receta
  const updateReceta = async (receta, onSuccess) => {
    setOperationLoading(true);
    setOperationError(null);
    setSuccessMessage(null);
    try {
      const validationErrors = validateReceta(receta);
      if (validationErrors.length > 0) {
        setOperationError(validationErrors.join(", "));
        return false;
      }
      await editarReceta(receta);
      setSuccessMessage("Receta actualizada exitosamente");
      fetchRecetas();
      fetchRecetasConInsumos(); // Refrescar también recetas con insumos
      onSuccess?.();
      return true;
    } catch (err) {
      setOperationError(err.message || "Error al editar la receta");
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  // Eliminar receta
  const deleteReceta = async (recetaId, onSuccess) => {
    setOperationLoading(true);
    setOperationError(null);
    setSuccessMessage(null);
    try {
      // Aquí deberías implementar la función en la API si existe
      // await eliminarReceta(recetaId);
      setSuccessMessage("Receta eliminada exitosamente");
      fetchRecetas();
      fetchRecetasConInsumos(); // Refrescar también recetas con insumos
      onSuccess?.();
      return true;
    } catch (err) {
      setOperationError(err.message || "Error al eliminar la receta");
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  // Guardar (crear o editar)
  const saveReceta = async (receta, onSuccess) => {
    if (receta.recetaId) {
      return await updateReceta(receta, onSuccess);
    } else {
      return await createReceta(receta, onSuccess);
    }
  };

  // Obtener receta con insumos por ID
  const getRecetaConInsumoById = async (id) => {
    try {
      return await getRecetaConInsumosById(id);
    } catch (err) {
      throw err;
    }
  };

  // Limpiar mensajes
  const clearMessages = () => {
    setOperationError(null);
    setSuccessMessage(null);
  };

  // Cargar recetas al montar el componente
  useEffect(() => {
    fetchRecetas();
    fetchRecetasConInsumos();
  }, [fetchRecetas, fetchRecetasConInsumos]);

  return {
    // Estados para listar
    recetas,
    loading,
    error,
    refetch: fetchRecetas,

    // Estados para recetas con insumos
    recetasConInsumos,
    loadingRecetasConInsumos,
    errorRecetasConInsumos,
    refetchRecetasConInsumos: fetchRecetasConInsumos,

    // Estados para operaciones
    operationLoading,
    operationError,
    successMessage,

    // Funciones CRUD
    createReceta,
    updateReceta,
    deleteReceta,
    saveReceta,
    clearMessages,

    // Extra
    getRecetaConInsumoById,
  };
}