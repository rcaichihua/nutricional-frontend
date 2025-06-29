// api/recetas.js
const API_URL = "http://localhost:8080/api/recetas";

export async function getRecetas() {
  const res = await fetch(API_URL);
  return res.json();
}

// Exporta más funciones según tu backend (crear, actualizar, etc.)