// src/api/menus.ts
import { Menu, MenuRecetasInsumosDTO } from "../types/Menu";
import { fetchJson } from "./fetchUtils";

const API_ENDPOINT = `/menus`;

type SucursalOpt = { sucursalId?: number | string };

/** Mezcla headers y agrega el header de sucursal si viene */
function withSucursalHeader(
  init: RequestInit | undefined,
  options?: SucursalOpt
): RequestInit {
  const headers = new Headers(init?.headers || {});
  if (options?.sucursalId != null) {
    headers.set("X-Sucursal-Id", String(options.sucursalId));
  }
  return { ...init, headers };
}

/* ===================== Menús (sin filtro de sucursal) ===================== */
export async function getMenus(): Promise<Menu[]> {
  return fetchJson(API_ENDPOINT);
}

export async function getMenusConInsumos(): Promise<Menu[]> {
  return fetchJson(`${API_ENDPOINT}/asignaciones/insumos`);
}

export async function getMenusConInsumosByDay(
  fecha: string
): Promise<MenuRecetasInsumosDTO[]> {
  return fetchJson(`${API_ENDPOINT}/fecha/${fecha}/recetas-insumos`);
}

export async function crearMenu(menu: Menu): Promise<Menu> {
  return fetchJson(API_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(menu),
  });
}

export async function editarMenu(menu: Menu): Promise<Menu> {
  return fetchJson(`${API_ENDPOINT}/${menu.menuId}`, {
    method: "PUT",
    body: JSON.stringify(menu),
  });
}

export async function eliminarMenu(menu: Menu): Promise<Menu> {
  return editarMenu({ ...menu, estado: "ELIMINADO" });
}

export async function getMenuValoresNutricionalesById(
  id: string
): Promise<any> {
  return fetchJson(`${API_ENDPOINT}/${id}/consolidado-nutricional`);
}

/* ===================== Asignaciones (con sucursal) ===================== */

/** Crea asignaciones para una fecha/tipoComida en la sucursal actual */
export async function crearAsignacionMenu(
  dto: any,
  options?: SucursalOpt
): Promise<any> {
  return fetchJson(
    `${API_ENDPOINT}/asignar`,
    withSucursalHeader(
      {
        method: "POST",
        body: JSON.stringify(dto),
      },
      options
    )
  );
}

/** Lista asignaciones (semana/actual) para la sucursal */
export async function getAsignacionMenus(
  options?: SucursalOpt
): Promise<any[]> {
  return fetchJson(
    `${API_ENDPOINT}/asignaciones`,
    withSucursalHeader(undefined, options)
  );
}

/** Elimina una asignación específica en la sucursal */
export async function eliminarAsignacionMenu(
  asignacionMenuId: number,
  options?: SucursalOpt
): Promise<void> {
  return fetchJson(
    `${API_ENDPOINT}/asignaciones/${asignacionMenuId}`,
    withSucursalHeader(
      {
        method: "DELETE",
      },
      options
    )
  );
}

/** Consulta asignaciones por día para la sucursal */
export async function getAsignacionMenusByDay(
  fecha: string,
  options?: SucursalOpt
): Promise<MenuRecetasInsumosDTO[]> {
  return fetchJson(
    `${API_ENDPOINT}/fecha/${fecha}/asignacion`,
    withSucursalHeader(undefined, options)
  );
}
