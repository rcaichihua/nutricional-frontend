// api/menu.js
const API_URL = "http://localhost:8080/api/menu";

export async function getMenuPlanificador() {
  const res = await fetch(API_URL);
  return res.json();
}

// Puedes agregar funciones para crear/actualizar/eliminar menú