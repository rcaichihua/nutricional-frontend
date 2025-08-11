import { API_URL_BASE } from "../config/constants";
import { Receta, RecetaConInsumosDTO } from "../types/Receta";
import { fetchJson } from "./fetchUtils";

const API_URL = `${API_URL_BASE}/recetas`;

export async function getRecetas(): Promise<Receta[]> {
  return fetchJson(API_URL);
}

export async function getRecetasConInsumos(): Promise<RecetaConInsumosDTO[]> {
  return fetchJson(API_URL);
}

export async function getRecetaConInsumosById(id: string): Promise<RecetaConInsumosDTO> {
  return fetchJson(`${API_URL}/${id}`);
}

export async function crearReceta(receta: Receta): Promise<Receta> {
  return fetchJson(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(receta),
  });
}

export async function editarReceta(receta: Receta): Promise<Receta> {
  return fetchJson(`${API_URL}/${receta.recetaId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(receta),
    });
}

 