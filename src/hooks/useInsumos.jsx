import { useEffect, useState, useCallback } from 'react';
import {
  getInsumos,
  crearInsumo,
  editarInsumo,
  eliminarInsumo,
} from '../api/insumos';
import { buildInsumoRequestDTO } from '../types/dto/buildInsumoRequestDTO';

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
      errors.push('Debes poner el nombre del insumo');
    }

    // Validación corregida para aceptar objetos o strings en 'grupo'
    const grupoValido =
      typeof insumo.grupo === 'string'
        ? insumo.grupo.trim().length > 0
        : insumo.grupo !== null && insumo.grupo !== undefined;

    if (!grupoValido) {
      errors.push('Selecciona el grupo');
    }

    // Validación corregida para 'subgrupo'
    const subgrupoValido =
      typeof insumo.subgrupo === 'string'
        ? insumo.subgrupo.trim().length > 0
        : insumo.subgrupo !== null && insumo.subgrupo !== undefined;

    if (!subgrupoValido) {
      errors.push('Debes poner el subgrupo del insumo');
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
        setOperationError(validationErrors.join(', '));
        return false;
      }

      const insumoRequest = buildInsumoRequestDTO(insumo);
      await crearInsumo(insumoRequest);

      setSuccessMessage('Insumo creado exitosamente');
      fetchInsumos(); // Recargar lista
      onSuccess?.();
      return true;
    } catch (err) {
      setOperationError(err.message || 'Error al crear el insumo');
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
        setOperationError(validationErrors.join(', '));
        return false;
      }

      const insumoRequest = buildInsumoRequestDTO(insumo);
      await editarInsumo({
        ...insumoRequest,
        insumoId: insumo.insumoId,
      });

      setSuccessMessage('Insumo actualizado exitosamente');
      fetchInsumos(); // Recargar lista
      onSuccess?.();
      return true;
    } catch (err) {
      setOperationError(err.message || 'Error al editar el insumo');
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
      await eliminarInsumo(insumo); // Se asume que 'insumo' es el ID o el objeto completo
      setSuccessMessage('Insumo eliminado exitosamente');
      fetchInsumos(); // Recargar lista
      onSuccess?.();
      return true;
    } catch (err) {
      // --- MEJORA EN EL MANEJO DE ERRORES ---
      // Si el backend devuelve un mensaje específico sobre dependencias (Foreign Key),
      // intentamos mostrarlo. Si es un error genérico, mostramos uno por defecto.
      console.error('Error al eliminar insumo:', err);

      let mensajeError = 'Error al eliminar el insumo';

      // Verificamos si el error viene con un mensaje del backend (común en APIs REST)
      if (err.message) {
        if (
          err.message.includes('constraint') ||
          err.message.includes('foreign key') ||
          err.message.includes('referencia')
        ) {
          mensajeError =
            'No se puede eliminar el insumo porque está siendo usado en una o más recetas.';
        } else {
          mensajeError = err.message;
        }
      }

      setOperationError(mensajeError);
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
