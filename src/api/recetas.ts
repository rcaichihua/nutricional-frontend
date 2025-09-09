import { Receta, RecetaConInsumosDTO } from "../types/Receta";
import { fetchJson } from "./fetchUtils";

// Se define solo el endpoint específico, no la URL completa.
const API_ENDPOINT = "/recetas";

export async function getRecetas(): Promise<Receta[]> {
  // Se pasa solo el endpoint a fetchJson.
  return fetchJson(API_ENDPOINT);
}

export async function getRecetasConInsumos(): Promise<RecetaConInsumosDTO[]> {
  // Se pasa solo el endpoint a fetchJson.
  return fetchJson(API_ENDPOINT);
}

export async function getRecetaConInsumosById(id: string): Promise<RecetaConInsumosDTO> {
  return fetchJson(`${API_ENDPOINT}/${id}`);
}

export async function crearReceta(receta: Receta): Promise<Receta> {
  return fetchJson(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(receta),
  });
}

export async function editarReceta(receta: Receta): Promise<Receta> {
  return fetchJson(`${API_ENDPOINT}/${receta.recetaId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(receta),
  });
}
