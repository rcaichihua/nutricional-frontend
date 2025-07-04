import { Insumo } from "../types/Insumo";
import { fetchJson } from "./fetchUtils";

const API_URL = "http://localhost:8080/api/insumos";

export async function getInsumos(): Promise<Insumo[]> {
  return fetchJson(API_URL);
}

export async function crearInsumo(insumo: Insumo): Promise<Insumo> {
  console.log("insumo", insumo);
  return fetchJson(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(insumo),
  });
}

export async function editarInsumo(insumo: Insumo): Promise<Insumo> {
  console.log("insumo", insumo);
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
