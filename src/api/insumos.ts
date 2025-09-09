import { Insumo } from "../types/Insumo";
import { fetchJson } from "./fetchUtils";

// Se define solo el endpoint específico, no la URL completa.
const API_ENDPOINT = "/insumos";

export async function getInsumos(): Promise<Insumo[]> {
  // Se pasa solo el endpoint a fetchJson.
  return fetchJson(API_ENDPOINT);
}

export async function crearInsumo(insumo: Insumo): Promise<Insumo> {
  return fetchJson(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(insumo),
  });
}

export async function editarInsumo(insumo: Insumo): Promise<Insumo> {
  return fetchJson(`${API_ENDPOINT}/${insumo.insumoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(insumo),
  });
}

export async function eliminarInsumo(insumo: Insumo): Promise<Insumo> {
  // La lógica de eliminación lógica se mantiene, llamando a editarInsumo.
  return editarInsumo({ ...insumo, estado: 'ELIMINADO' });
}
