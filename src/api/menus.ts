import { Menu, MenuRecetasInsumosDTO } from "../types/Menu";
import { fetchJson } from "./fetchUtils";

// La URL base ya no es necesaria aquí, se manejará en fetchJson
const API_ENDPOINT = `/menus`;

export async function getMenus(): Promise<Menu[]> {
  // Ahora solo pasamos la parte específica de la ruta
  return fetchJson(API_ENDPOINT);
}

export async function getMenusConInsumos(): Promise<Menu[]> {
  return fetchJson(`${API_ENDPOINT}/asignaciones/insumos`);
}

export async function getMenusConInsumosByDay(fecha: string): Promise<MenuRecetasInsumosDTO[]> {
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
  return editarMenu({ ...menu, estado: 'ELIMINADO' });
}

export async function getMenuValoresNutricionalesById(id: string): Promise<any> {
  return fetchJson(`${API_ENDPOINT}/${id}/consolidado-nutricional`);
}

export async function crearAsignacionMenu(menu: any): Promise<any> {
  return fetchJson(`${API_ENDPOINT}/asignar`, {
    method: "POST",
    body: JSON.stringify(menu),
  });
}

export async function getAsignacionMenus(): Promise<any[]> {
  return fetchJson(`${API_ENDPOINT}/asignaciones`);
}

export async function eliminarAsignacionMenu(asignacionMenuId: number): Promise<void> {
  return fetchJson(`${API_ENDPOINT}/asignaciones/${asignacionMenuId}`, {
    method: "DELETE",
  });
}

export async function getAsignacionMenusByDay(fecha: string): Promise<MenuRecetasInsumosDTO[]> {
  return fetchJson(`${API_ENDPOINT}/fecha/${fecha}/asignacion`);
}