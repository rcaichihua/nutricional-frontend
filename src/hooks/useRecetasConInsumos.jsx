import { useEffect, useState, useCallback } from "react";
import { getRecetasConInsumos } from "../api/recetas";

export function useRecetasConInsumos() {
  const [recetasConInsumos, setRecetasConInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecetasConInsumos = useCallback(() => {
    setLoading(true);
    getRecetasConInsumos()
      .then(setRecetasConInsumos)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRecetasConInsumos();
  }, [fetchRecetasConInsumos]);

  return { recetasConInsumos, loading, error, refetch: fetchRecetasConInsumos };
} 