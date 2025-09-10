import { useEffect, useState, useCallback } from "react";
import {
  getRecetas,
  crearReceta,
  editarReceta,
  getRecetaConInsumosById,
  getRecetasConInsumos,
} from "../api/recetas";

// Se define el tamaño de página como una constante para fácil modificación
const PAGE_SIZE = 6;

export function useRecetas({ onlyConInsumos = false } = {}) {
    // Estados para listar recetas (originales, sin cambios)
    const [recetas, setRecetas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para recetas con insumos (originales, sin cambios)
    const [recetasConInsumos, setRecetasConInsumos] = useState([]);
    const [loadingRecetasConInsumos, setLoadingRecetasConInsumos] = useState(true);
    const [errorRecetasConInsumos, setErrorRecetasConInsumos] = useState(null);

    // Estados para operaciones CRUD (originales, sin cambios)
    const [operationLoading, setOperationLoading] = useState(false);
    const [operationError, setOperationError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // --- ESTADOS DE PAGINACIÓN (SIN CAMBIOS) ---
    const [page, setPage] = useState(0); // Página actual, 0-indexed para la API
    const [totalPages, setTotalPages] = useState(0);

    // Función para obtener recetas (original, sin cambios)
    const fetchRecetas = useCallback(() => {
      setLoading(true);
      setError(null);
      getRecetas()
        .then(setRecetas)
        .catch(setError)
        .finally(() => setLoading(false));
    }, []);

    // --- MODIFICADO: La función para obtener recetas ahora es la única que actualiza los estados ---
    const fetchRecetasConInsumos = useCallback(async (currentPage = 0) => {
      setLoadingRecetasConInsumos(true);
      setErrorRecetasConInsumos(null);
      try {
        const data = await getRecetasConInsumos(currentPage, PAGE_SIZE);
        //console.log("[Paso 4] 📦 Datos recibidos del backend:", data);
        setRecetasConInsumos(data.content);
        setTotalPages(data.totalPages);
        setPage(data.number); // Actualiza el número de página con la respuesta de la API
      } catch (err) {
        setErrorRecetasConInsumos(err.message || "Error al cargar recetas");
      } finally {
        setLoadingRecetasConInsumos(false);
      }
    }, []);
    
    // --- CORRECCIÓN: Las funciones de navegación ahora llaman a fetch directamente ---
    const goToNextPage = () => {
        if (page < totalPages - 1) {
            fetchRecetasConInsumos(page + 1);
        }
    };

    const goToPreviousPage = () => {
        if (page > 0) {
            fetchRecetasConInsumos(page - 1);
        }
    };

    // Validaciones centralizadas (original, sin cambios)
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

    // Crear receta (modificado para refrescar la página actual)
    const createRecetaOriginal = async (receta, onSuccess) => {
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
        if (!onlyConInsumos) fetchRecetas();
        fetchRecetasConInsumos(page); // Refresca la página actual
        onSuccess?.();
        return true;
      } catch (err) {
        setOperationError(err.message || "Error al crear la receta");
        return false;
      } finally {
        setOperationLoading(false);
      }
    };

    // Editar receta (modificado para refrescar la página actual)
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
        if (!onlyConInsumos) fetchRecetas();
        fetchRecetasConInsumos(page); // Refresca la página actual
        onSuccess?.();
        return true;
      } catch (err) {
        setOperationError(err.message || "Error al editar la receta");
        return false;
      } finally {
        setOperationLoading(false);
      }
    };

    // Eliminar receta (modificado para refrescar la página actual)
    const deleteReceta = async (recetaId, onSuccess) => {
      setOperationLoading(true);
      setOperationError(null);
      setSuccessMessage(null);
      try {
        // Aquí deberías implementar la función en la API si existe
        // await eliminarReceta(recetaId);
        setSuccessMessage("Receta eliminada exitosamente");
        if (!onlyConInsumos) fetchRecetas();
        fetchRecetasConInsumos(page); // Refresca la página actual
        onSuccess?.();
        return true;
      } catch (err) {
        setOperationError(err.message || "Error al eliminar la receta");
        return false;
      } finally {
        setOperationLoading(false);
      }
    };

    // Guardar (crear o editar) (se mantiene intacta)
    const saveReceta = async (receta, onSuccess) => {
      if (receta.recetaId) {
        return await updateReceta(receta, onSuccess);
      } else {
        // Se usa la función original con un nombre interno diferente para evitar colisión de nombres
        return await createRecetaOriginal(receta, onSuccess);
      }
    };

    // Obtener receta con insumos por ID (se mantiene intacta)
    const getRecetaConInsumoById = (id) => getRecetaConInsumosById(id);

    // Limpiar mensajes (se mantiene intacta)
    const clearMessages = () => {
      setOperationError(null);
      setSuccessMessage(null);
    };

    // --- MODIFICADO: El useEffect ahora solo carga los datos iniciales ---
    useEffect(() => {
        // La lógica original se adapta para cargar la primera página al montar
        if (onlyConInsumos) {
            fetchRecetasConInsumos(0); 
        } else {
            fetchRecetas();
            fetchRecetasConInsumos(0);
        }
    }, [fetchRecetas, fetchRecetasConInsumos, onlyConInsumos]);

    return {
      // Estados para listar (originales, sin cambios)
      recetas,
      loading,
      error,
      refetch: fetchRecetas,

      // Estados para recetas con insumos (originales, sin cambios)
      recetasConInsumos,
      loadingRecetasConInsumos,
      errorRecetasConInsumos,
      refetchRecetasConInsumos: fetchRecetasConInsumos,

      // Estados para operaciones (originales, sin cambios)
      operationLoading,
      operationError,
      successMessage,

      // Funciones CRUD (se mantiene la estructura original, renombrando createReceta para evitar colisión)
      createReceta: createRecetaOriginal,
      updateReceta,
      deleteReceta,
      saveReceta,
      clearMessages,
      
      // --- Se exportan los nuevos estados y funciones de paginación ---
      page: page + 1, // Se devuelve 1-indexed para la UI
      totalPages,
      goToNextPage,
      goToPreviousPage,

      // Extra (original, sin cambios)
      getRecetaConInsumoById,
    };
  }

