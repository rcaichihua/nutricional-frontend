import { useEffect, useState, useCallback } from "react";
import { getAlimentos } from "../api/alimentos";

export function useAlimentos() {
  const [alimentos, setAlimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlimentos = useCallback(() => {
    setLoading(true);
    getAlimentos()
      .then(setAlimentos)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAlimentos();
  }, [fetchAlimentos]);

  return { alimentos, loading, error, refetch: fetchAlimentos };
}