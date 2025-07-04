import { useEffect, useState, useCallback } from "react";
import { getRecetaIngredientes } from "../api/recetasIngrediente";

export function useRecetaIngredientes() {
  const [recetaIngredientes, setRecetaIngredientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecetaIngredientes = useCallback(() => {
    setLoading(true);
    getRecetaIngredientes()
      .then(setRecetaIngredientes)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRecetaIngredientes();
  }, [fetchRecetaIngredientes]);

  return { recetaIngredientes, loading, error, refetch: fetchRecetaIngredientes };
}