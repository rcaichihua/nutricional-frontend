// src/api/menus.ts
import { Menu, MenuRecetasInsumosDTO } from "../types/Menu";
import { fetchJson } from "./fetchUtils";

const API_ENDPOINT = `/menus`;

type SucursalOpt = { sucursalId?: number | string };

/** Obtiene el id de sucursal desde localStorage (plano o dentro de "auth") */
function getStoredSucursalId(): number | null {
  const raw = localStorage.getItem("sucursalId");
  if (raw != null) return Number(raw);

  const authRaw = localStorage.getItem("auth");
  if (authRaw) {
    try {
      const auth = JSON.parse(authRaw);
      if (auth?.defaultSucursalId != null) return Number(auth.defaultSucursalId);
    } catch {
      // ignore JSON error
    }
  }
  return null;
}

/** Mezcla headers y agrega el header de sucursal (de options o de localStorage) */
function withSucursalHeader(
  init: RequestInit | undefined,
  options?: SucursalOpt
): RequestInit {
  const headers = new Headers(init?.headers || {});
  const sucursalId =
    options?.sucursalId != null ? Number(options.sucursalId) : getStoredSucursalId();

  if (sucursalId != null && !Number.isNaN(sucursalId)) {
    headers.set("X-Sucursal-Id", String(sucursalId));
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
  fecha: string,
  options?: SucursalOpt 
): Promise<MenuRecetasInsumosDTO[]> {
  return fetchJson(
    `${API_ENDPOINT}/fecha/${fecha}/recetas-insumos`,
    withSucursalHeader(undefined, options)
  );
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

/** Crea asignaciones para una fecha/tipoComida usando la sucursal guardada */
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

/** Lista asignaciones para la sucursal guardada */
export async function getAsignacionMenus(
  options?: SucursalOpt
): Promise<any[]> {
  let url = `${API_ENDPOINT}/asignaciones`;

  // El backend espera ?sucursalId=...
  const qp: string[] = [];
  if (options?.sucursalId != null) {
    qp.push(`sucursalId=${encodeURIComponent(String(options.sucursalId))}`);
  }
  // cache-buster para evitar resultados cacheados
  qp.push(`_=${Date.now()}`);

  if (qp.length) url += `?${qp.join("&")}`;

  return fetchJson(url);
}

/** Elimina una asignación específica en la sucursal (header por consistencia) */
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

/** Consulta asignaciones por día en la sucursal guardada */
export async function getAsignacionMenusByDay(
  fecha: string,
  options?: SucursalOpt
): Promise<MenuRecetasInsumosDTO[]> {
  return fetchJson(
    `${API_ENDPOINT}/fecha/${fecha}/asignacion`,
    withSucursalHeader(undefined, options)
  );
}
