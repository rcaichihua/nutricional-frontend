import { Receta, RecetaConInsumosDTO } from "../types/Receta";
import { fetchJson } from "./fetchUtils";

// api/recetas.js
const API_URL = "http://localhost:8080/api/recetas";

export async function getRecetas(): Promise<Receta[]> {
  return fetchJson(API_URL);
}

export async function getRecetasConInsumos(): Promise<RecetaConInsumosDTO[]> {
  return fetchJson(API_URL + "/todos-con-insumos");
}

export async function crearReceta(receta: Receta): Promise<Receta> {
  return fetchJson(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(receta),
  });
}

export async function editarReceta(receta: Receta): Promise<Receta> {
  const res = await fetch(`${API_URL}/${receta.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(receta),
  });
  if (!res.ok) throw new Error("Error al editar receta");
  return res.json();
}

 