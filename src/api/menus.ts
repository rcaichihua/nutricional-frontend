import { Menu, MenuRecetasInsumosDTO } from "../types/Menu";
import { fetchJson } from "./fetchUtils";

const API_ENDPOINT = `/menus`;

const REPORTE_ENDPOINT = `/reporte`;

const OBSERVACIONES_ENDPOINT = `/observaciones`;

type SucursalOpt = { sucursalId?: number | string };

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

export async function getAsignacionMenus(
  options?: SucursalOpt
): Promise<any[]> {
  let url = `${API_ENDPOINT}/asignaciones`;

  const qp: string[] = [];
  if (options?.sucursalId != null) {
    qp.push(`sucursalId=${encodeURIComponent(String(options.sucursalId))}`);
  }

  qp.push(`_=${Date.now()}`);

  if (qp.length) url += `?${qp.join("&")}`;

  return fetchJson(url);
}

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

export async function getAsignacionMenusByDay(
  fecha: string,
  options?: SucursalOpt
): Promise<MenuRecetasInsumosDTO[]> {
  return fetchJson(
    `${API_ENDPOINT}/fecha/${fecha}/asignacion`,
    withSucursalHeader(undefined, options)
  );
}

export async function getReporteNutricionalDia(
  fecha: string,
  sucursalId: number | string,
  comensales: number
): Promise<any> {
  const params = new URLSearchParams({
    fecha,
    sucursalId: String(sucursalId),
    comensales: String(comensales),
  });

  return fetchJson(
    `${REPORTE_ENDPOINT}/dia-nutricional?${params.toString()}`,
    withSucursalHeader(undefined, { sucursalId })
  );
}

export async function guardarObservacion(
  dto: { fecha: string; observacion: string },
  options?: SucursalOpt
): Promise<any> {
  return fetchJson(
    OBSERVACIONES_ENDPOINT,
    withSucursalHeader(
      {
        method: "POST",
        body: JSON.stringify(dto),
      },
      options
    )
  );
}

export async function getObservacionDia(
  fecha: string,
  options?: SucursalOpt
): Promise<any> {
  return fetchJson(
    `${OBSERVACIONES_ENDPOINT}/dia?fecha=${fecha}`,
    withSucursalHeader(undefined, options)
  );
}

export async function getObservacionesRango(
  inicio: string,
  fin: string,
  options?: SucursalOpt
): Promise<any[]> {
  return fetchJson(
    `${OBSERVACIONES_ENDPOINT}/rango?inicio=${inicio}&fin=${fin}`,
    withSucursalHeader(undefined, options)
  );
}