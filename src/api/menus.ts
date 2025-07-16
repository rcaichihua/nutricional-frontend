import { API_URL_BASE } from "../config/constants";
import { Menu } from "../types/Menu";
import { fetchJson } from "./fetchUtils";

const API_URL = `${API_URL_BASE}/menus`;

export async function getMenus(): Promise<Menu[]> {
  return fetchJson(API_URL);
}

export async function crearMenu(menu: Menu): Promise<Menu> {
  return fetchJson(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(menu),
  });
}

export async function editarMenu(menu: Menu): Promise<Menu> {
  const res = await fetch(`${API_URL}/${menu.menuId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(menu),
  });
  if (!res.ok) throw new Error("Error al editar menu");
  return res.json();
}

export async function eliminarMenu(menu: Menu): Promise<Menu> {
  return editarMenu({ ...menu, estado: 'ELIMINADO' });
}
