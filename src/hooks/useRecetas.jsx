import { useEffect, useState, useCallback, useMemo } from "react";
import {
  crearReceta,
  editarReceta,
  getRecetaConInsumosById,
  getRecetasConInsumos, // La función que obtiene datos paginados
  eliminarReceta,
  getAllRecetasConInsumos // La función que obtiene TODOS los datos
} from "../api/recetas";

// Tamaño de página para la lista principal
const PAGE_SIZE = 6;

export function useRecetas() {
  // Estados para la lista PAGINADA (usada en la vista principal)
  const [recetasPaginadas, setRecetasPaginadas] = useState([]);
  const [loadingPaginado, setLoadingPaginado] = useState(true);
  const [errorPaginado, setErrorPaginado] = useState(null);
  
  // ESTADO: Para la lista COMPLETA de recetas (usada en el modal)
  const [allRecetasConInsumos, setAllRecetasConInsumos] = useState([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [errorAll, setErrorAll] = useState(null);

  // ESTADO: Para el término de búsqueda del filtro
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para operaciones CRUD
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationError, setOperationError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Estados de paginación
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // --- LÓGICA DE OBTENCIÓN DE DATOS ---

  const fetchRecetasPaginadas = useCallback(async (currentPage = 0) => {
    setLoadingPaginado(true);
    setErrorPaginado(null);
    try {
      const data = await getRecetasConInsumos(currentPage, PAGE_SIZE);
      setRecetasPaginadas(data.content || []);
      setTotalPages(data.totalPages || 0);
      setPage(data.number || 0);
    } catch (err) {
      setErrorPaginado(err.message || "Error al cargar recetas paginadas");
      setRecetasPaginadas([]);
    } finally {
      setLoadingPaginado(false);
    }
  }, []);

  // =================================================================================
  // FUNCIÓN CRÍTICA CON DIAGNÓSTICO
  // =================================================================================
  const fetchAllRecetasConInsumos = useCallback(async () => {
    setLoadingAll(true);
    setErrorAll(null);
    // --- DIAGNÓSTICO DETALLADO ---
    console.log("--- DIAGNÓSTICO DE CARGA: fetchAllRecetasConInsumos ---");
    console.log("PASO 1: Intentando llamar a getAllRecetasConInsumos() desde la API...");
    try {
      const allData = await getAllRecetasConInsumos();
      console.log("PASO 2: Respuesta RECIBIDA de la API:", allData); // <-- ¡ESTA LÍNEA ES CLAVE!
      
      // Verificación adicional: ¿Es realmente un array?
      if (Array.isArray(allData)) {
          console.log(`PASO 3: La respuesta ES un array con ${allData.length} elementos.`);
          setAllRecetasConInsumos(allData);
      } else {
          console.error("PASO 3: ¡ERROR! La respuesta de la API NO es un array. Es:", typeof allData, allData);
          setErrorAll("La respuesta de la API no tiene el formato esperado.");
          setAllRecetasConInsumos([]); // Aseguramos que sea un array vacío en caso de formato incorrecto
      }
      console.log("-------------------------------------------------------");

    } catch (err) {
      console.error("PASO 2: ¡FALLÓ la llamada a la API 'getAllRecetasConInsumos'!", err);
      setErrorAll(err.message || "Error al cargar todas las recetas");
      setAllRecetasConInsumos([]);
      console.log("-------------------------------------------------------");
    } finally {
      setLoadingAll(false);
    }
  }, []); // Dependencias vacías son correctas aquí

  // --- LÓGICA DE FILTRADO ---

  const filteredRecetas = useMemo(() => {
    if (!searchTerm) {
      return allRecetasConInsumos; // Si no hay búsqueda, devuelve la lista completa
    }
    // Filtra por nombre, ignorando mayúsculas/minúsculas
    return allRecetasConInsumos.filter(receta =>
        // Añadimos una verificación extra por si 'receta.nombre' es null o undefined
        receta && receta.nombre && receta.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allRecetasConInsumos, searchTerm]);


  // --- FUNCIONES DE NAVEGACIÓN Y CRUD ---

  const goToNextPage = () => {
    if (page < totalPages - 1) {
      fetchRecetasPaginadas(page + 1);
    }
  };

  const goToPreviousPage = () => {
    if (page > 0) {
      fetchRecetasPaginadas(page - 1);
    }
  };
  
  // Función centralizada para refrescar datos después de una operación
  const handleSuccessCRUD = () => {
    fetchRecetasPaginadas(page); // Refresca la página actual
    fetchAllRecetasConInsumos(); // Refresca la lista completa
  };

  const saveReceta = async (receta, onSuccess) => {
    setOperationLoading(true);
    setOperationError(null);
    setSuccessMessage(null);
    try {
      if (receta.recetaId) {
        await editarReceta(receta);
        setSuccessMessage("Receta actualizada exitosamente");
      } else {
        await crearReceta(receta);
        setSuccessMessage("Receta creada exitosamente");
      }
      handleSuccessCRUD();
      onSuccess?.();
      return true;
    } catch (err) {
      setOperationError(err.message || "Error al guardar la receta");
      return false;
    } finally {
      setOperationLoading(false);
    }
  };
  
  const deleteReceta = async (recetaId, onSuccess) => {
    setOperationLoading(true);
    setOperationError(null);
    setSuccessMessage(null);
    try {
      await eliminarReceta(recetaId);
      setSuccessMessage("Receta eliminada exitosamente");
      handleSuccessCRUD();
      onSuccess?.();
      return true;
    } catch (err) {
      setOperationError(err.message || "Error al eliminar la receta");
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  const clearMessages = () => {
    setOperationError(null);
    setSuccessMessage(null);
  };

  // --- EFECTO DE CARGA INICIAL ---
  useEffect(() => {
    // Llama a ambas funciones para poblar los dos estados al montar el componente.
    console.log("[useEffect inicial] Llamando a fetchRecetasPaginadas y fetchAllRecetasConInsumos...");
    fetchRecetasPaginadas(0);
    fetchAllRecetasConInsumos();
  }, [fetchRecetasPaginadas, fetchAllRecetasConInsumos]); // Las dependencias son correctas


  // --- VALOR DE RETORNO DEL HOOK ---
  return {
    // Para la vista principal (PAGINADO)
    recetasConInsumos: recetasPaginadas, // Mantenemos el nombre para retrocompatibilidad
    loadingRecetasConInsumos: loadingPaginado,
    errorRecetasConInsumos: errorPaginado,
    page: page + 1,
    totalPages,
    goToNextPage,
    goToPreviousPage,

    // Para el MODAL (LISTA COMPLETA + FILTRO)
    filteredRecetas,
    allRecetasConInsumos, // Exportamos la lista completa original
    loadingAllRecetas: loadingAll,
    errorAllRecetas: errorAll,
    searchTerm,
    setSearchTerm,

    // El resto de funciones y estados
    operationLoading,
    operationError,
    successMessage,
    saveReceta,
    deleteReceta,
    clearMessages,
    getRecetaConInsumoById: getRecetaConInsumosById,
  };
}

