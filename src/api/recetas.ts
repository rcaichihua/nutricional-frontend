import { Receta, RecetaConInsumosDTO } from "../types/Receta";
import { fetchJson } from "./fetchUtils";

// Se define solo el endpoint específico, no la URL completa.
const API_ENDPOINT = "/recetas";

// --- NUEVO: Se define un tipo genérico para la respuesta paginada del backend ---
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // Página actual (0-indexed)
}

// La función ahora es obsoleta, se usará la paginada en su lugar
export async function getRecetas(): Promise<Receta[]> {
  return fetchJson(API_ENDPOINT);
}

// --- MODIFICADO: La función ahora acepta parámetros de paginación ---
export async function getRecetasConInsumos(page: number, size: number): Promise<Page<RecetaConInsumosDTO>> {
  // Se añaden los parámetros de página y tamaño a la URL
  return fetchJson(`${API_ENDPOINT}?page=${page}&size=${size}`);
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
// --- NUEVA FUNCIÓN PARA ELIMINAR UNA RECETA ---
/**
 * Envía una petición para eliminar (lógicamente) una receta por su ID.
 * @param recetaId El ID de la receta a eliminar.
 */
export async function eliminarReceta(recetaId: number): Promise<void> {
  return fetchJson(`${API_ENDPOINT}/${recetaId}`, {
    method: "DELETE",
  });
}

