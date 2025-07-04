import { useEffect, useState, useCallback } from "react";
import { getRecetas } from "../api/recetas";

export function useRecetas() {
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecetas = useCallback(() => {
    setLoading(true);
    getRecetas()
      .then(setRecetas)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRecetas();
  }, [fetchRecetas]);

  // Devuelve las recetas con ingredientes (aquí se asume que cada receta ya tiene un campo 'ingredientes')
  const recetasConIngredientes = recetas.filter(r => r.ingredientes && r.ingredientes.length > 0);

  return { recetas, loading, error, refetch: fetchRecetas, recetasConIngredientes };
}