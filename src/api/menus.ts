import { API_URL_BASE } from "../config/constants";
import { Menu, MenuRecetasInsumosDTO } from "../types/Menu";
import { fetchJson } from "./fetchUtils";

const API_URL = `${API_URL_BASE}/menus`;

export async function getMenus(): Promise<Menu[]> {
  return fetchJson(API_URL);
}

export async function getMenusConInsumos(): Promise<Menu[]> {
  return fetchJson(`${API_URL}/asignaciones/insumos`);
}

export async function getMenusConInsumosByDay(fecha: string): Promise<MenuRecetasInsumosDTO[]> {
  return fetchJson(`${API_URL}/fecha/${fecha}/recetas-insumos`);
}

export async function crearMenu(menu: Menu): Promise<Menu> {
  return fetchJson(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(menu),
  });
}

export async function editarMenu(menu: Menu): Promise<Menu> {
  return fetchJson(`${API_URL}/${menu.menuId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(menu),
  });
}

export async function eliminarMenu(menu: Menu): Promise<Menu> {
  return editarMenu({ ...menu, estado: 'ELIMINADO' });
}

export async function getMenuValoresNutricionalesById(id: string): Promise<any> {
  return fetchJson(`${API_URL}/${id}/consolidado-nutricional`);
}

export async function crearAsignacionMenu(menu: any): Promise<any> {
  return fetchJson(`${API_URL}/asignar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(menu),
  });
}

export async function getAsignacionMenus(): Promise<Menu[]> {
  return fetchJson(`${API_URL}/asignaciones`);
}

export async function getAsignacionMenusByDay(fecha: string): Promise<MenuRecetasInsumosDTO[]> {
  return fetchJson(`${API_URL}/fecha/${fecha}/asignacion`);
}
