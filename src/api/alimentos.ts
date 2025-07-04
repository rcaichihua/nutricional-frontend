import { AlimentoNutricional } from "../types/AlimentoNutricional";
import { fetchJson } from "./fetchUtils";

const API_URL = "http://localhost:8080/api/insumos  ";

export async function getAlimentos(): Promise<AlimentoNutricional[]> {
  return fetchJson(API_URL);
}

export async function crearAlimento(alimento: AlimentoNutricional): Promise<AlimentoNutricional> {
  return fetchJson(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(alimento),
  });
}

export async function editarAlimento(alimento: AlimentoNutricional): Promise<AlimentoNutricional> {
  const res = await fetch(`${API_URL}/${alimento.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(alimento),
  });
  if (!res.ok) throw new Error("Error al editar alimento");
  return res.json();
}

export async function eliminarAlimento(alimento: AlimentoNutricional): Promise<AlimentoNutricional> {
  return editarAlimento({ ...alimento, estado: 'ELIMINADO' });
}
