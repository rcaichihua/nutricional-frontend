import { RecetaIngrediente } from "../types/RecetaIngrediente";
import { fetchJson } from "./fetchUtils";

// api/recetas.js
const API_URL = "http://localhost:8080/api/receta-ingredientes";

export async function getRecetaIngredientes(): Promise<RecetaIngrediente[]> {
  return fetchJson(API_URL);
}

export async function crearReceta(receta: RecetaIngrediente): Promise<RecetaIngrediente> {
  return fetchJson(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(receta),
  });
}

export async function editarAlimento(receta: RecetaIngrediente): Promise<RecetaIngrediente> {
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

 