import { API_URL_BASE } from "../config/constants";
import { Insumo } from "../types/Insumo";
import { fetchJson } from "./fetchUtils";

const API_URL = `${API_URL_BASE}/insumos`;

export async function getInsumos(): Promise<Insumo[]> {
  return fetchJson(API_URL);
}

export async function crearInsumo(insumo: Insumo): Promise<Insumo> {
  return fetchJson(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(insumo),
  });
}

export async function editarInsumo(insumo: Insumo): Promise<Insumo> {
  const res = await fetch(`${API_URL}/${insumo.insumoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(insumo),
  });
  if (!res.ok) throw new Error("Error al editar insumo");
  return res.json();
}

export async function eliminarInsumo(insumo: Insumo): Promise<Insumo> {
  return editarInsumo({ ...insumo, estado: 'ELIMINADO' });
}
