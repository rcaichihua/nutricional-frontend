import { useEffect, useState, useCallback } from "react";
import { getInsumos, crearInsumo, editarInsumo, eliminarInsumo } from "../api/insumos";
import { buildInsumoRequestDTO } from "../types/dto/buildInsumoRequestDTO";

export function useInsumos() {
  // Estados para listar insumos
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para operaciones CRUD
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationError, setOperationError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Función para obtener insumos
  const fetchInsumos = useCallback(() => {
    setLoading(true);
    setError(null);
    getInsumos()
      .then(setInsumos)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  // Validaciones centralizadas
  const validateInsumo = (insumo) => {
    const errors = [];
    
    if (!insumo.nombre?.trim()) {
      errors.push("Debes poner el nombre del insumo");
    }

    // --- CORRECCIÓN DE VALIDACIÓN DE GRUPO ---
    // Verificamos si grupo existe.
    // Si es string, usamos trim().
    // Si es objeto o número (ID), verificamos que no sea nulo/undefined.
    const grupoValido = typeof insumo.grupo === 'string' 
      ? insumo.grupo.trim().length > 0 
      : (insumo.grupo !== null && insumo.grupo !== undefined);

    console.log('Hola -- ' + insumo.grupo);

    if (!grupoValido) {
      errors.push("Selecciona el grupo");
    }
    
    if (!insumo.subgrupo?.trim()) {
      errors.push("Debes poner el subgrupo del insumo");
    }
    
    return errors;
  };

  // Crear insumo
  const createInsumo = async (insumo, onSuccess) => {
    setOperationLoading(true);
    setOperationError(null);
    setSuccessMessage(null);

    try {
      const validationErrors = validateInsumo(insumo);
      if (validationErrors.length > 0) {
        setOperationError(validationErrors.join(", "));
        return false;
      }

      const insumoRequest = buildInsumoRequestDTO(insumo);
      await crearInsumo(insumoRequest);
      
      setSuccessMessage("Insumo creado exitosamente");
      fetchInsumos(); // Recargar lista
      onSuccess?.();
      return true;
    } catch (err) {
      setOperationError(err.message || "Error al crear el insumo");
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  // Editar insumo
  const updateInsumo = async (insumo, onSuccess) => {
    setOperationLoading(true);
    setOperationError(null);
    setSuccessMessage(null);

    try {
      const validationErrors = validateInsumo(insumo);
      if (validationErrors.length > 0) {
        setOperationError(validationErrors.join(", "));
        return false;
      }

      const insumoRequest = buildInsumoRequestDTO(insumo);
      await editarInsumo({ ...insumoRequest, insumoId: insumo.insumoId });
      
      setSuccessMessage("Insumo actualizado exitosamente");
      fetchInsumos(); // Recargar lista
      onSuccess?.();
      return true;
    } catch (err) {
      setOperationError(err.message || "Error al editar el insumo");
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  // Eliminar insumo
  const deleteInsumo = async (insumo, onSuccess) => {
    setOperationLoading(true);
    setOperationError(null);
    setSuccessMessage(null);

    try {
      await eliminarInsumo(insumo);
      setSuccessMessage("Insumo eliminado exitosamente");
      fetchInsumos(); // Recargar lista
      onSuccess?.();
      return true;
    } catch (err) {
      setOperationError(err.message || "Error al eliminar el insumo");
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  // Guardar (crear o editar)
  const saveInsumo = async (insumo, onSuccess) => {
    if (insumo.insumoId) {
      return await updateInsumo(insumo, onSuccess);
    } else {
      return await createInsumo(insumo, onSuccess);
    }
  };

  // Limpiar mensajes
  const clearMessages = () => {
    setOperationError(null);
    setSuccessMessage(null);
  };

  // Cargar insumos al montar el componente
  useEffect(() => {
    fetchInsumos();
  }, [fetchInsumos]);

  return {
    // Estados para listar
    insumos,
    loading,
    error,
    refetch: fetchInsumos,
    
    // Estados para operaciones
    operationLoading,
    operationError,
    successMessage,
    
    // Funciones CRUD
    createInsumo,
    updateInsumo,
    deleteInsumo,
    saveInsumo,
    clearMessages,
  };
}