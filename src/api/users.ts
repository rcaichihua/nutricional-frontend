// src/api/users.ts
import { fetchJson } from "./fetchUtils";

export type SucursalLite = { id: number; nombre: string; esDefault?: boolean };
export type UsuarioAdmin = {
  id: number;
  username: string;
  roles: string[];
  activo: boolean;
  sucursales: SucursalLite[]; // <- lo que devuelve el backend
};

export async function listUsers(): Promise<UsuarioAdmin[]> {
  return fetchJson("/auth/users");
}

export async function listSucursalesLite(): Promise<SucursalLite[]> {
  return fetchJson("/sucursales/lite");
}

// Stubs (si aún no tienes endpoints de crear/editar/eliminar)
export async function createUser(_: any) {
  throw new Error("Crear usuario: endpoint no implementado en backend.");
}
export async function updateUser(_: number, __: any) {
  throw new Error("Actualizar usuario: endpoint no implementado en backend.");
}
export async function deleteUser(_: number) {
  throw new Error("Eliminar usuario: endpoint no implementado en backend.");
}
