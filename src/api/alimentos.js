// api/alimentos.js
// Aquí van las funciones para consumir la API de alimentos_nutricionales

// Ejemplo (ajusta la URL base a la de tu backend Spring):
const API_URL = "http://localhost:8080/api/alimentos";

export async function getAlimentos() {
  const res = await fetch(API_URL);
  return res.json();
}

// Puedes agregar más funciones luego (crear, actualizar, buscar, etc.)
