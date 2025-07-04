import { useEffect, useState, useCallback } from "react";
import { getInsumos } from "../api/insumos";

export function useInsumos() {
  const [insumos, setInsumo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsumos = useCallback(() => {
    setLoading(true);
    getInsumos()
      .then(setInsumo)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchInsumos();
  }, [fetchInsumos]);

  return { insumos, loading, error, refetch: fetchInsumos };
}