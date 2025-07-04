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

  return { recetas, loading, error, refetch: fetchRecetas };
}