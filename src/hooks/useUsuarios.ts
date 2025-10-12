// src/hooks/useUsuarios.ts
import { useEffect, useState } from "react";
import {
  listUsers,
  listSucursalesLite,
  createUser,
  updateUser,
  deleteUser,
  type UsuarioAdmin,
  type SucursalLite,
} from "../api/users";

export function useUsuarios(loadOnMount = true) {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [sucursales, setSucursales] = useState<SucursalLite[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const reload = async () => {
    setError("");
    setLoading(true);
    try {
      const [us, sucs] = await Promise.all([
        listUsers(),
        listSucursalesLite().catch(() => []),
      ]);
      setUsuarios(us ?? []);
      setSucursales(sucs ?? []);
    } catch (e: any) {
      setError(e?.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loadOnMount) reload();
  }, [loadOnMount]);

  return {
    usuarios,
    sucursales, // disponible si lo necesitas desde el hook
    error,
    loading,
    reload,
    create: createUser,
    update: updateUser,
    remove: deleteUser,
  };
}
