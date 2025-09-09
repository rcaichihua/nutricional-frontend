import { API_URL_BASE } from "../config/constants";

const API_URL_AUTH = `${API_URL_BASE}/auth`;

export async function login(username, password) {
  const response = await fetch(`${API_URL_AUTH}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  // 1. Se lee la respuesta como JSON en lugar de texto
  const responseData = await response.json();

  // 2. Se verifica la propiedad 'success' del JSON que envía el backend
  if (!response.ok || !responseData.success) {
    // Si hay un error, se usa el mensaje del backend para más claridad
    throw new Error(responseData.message || "Credenciales inválidas");
  }

  // 3. Se extrae el token de la ruta correcta (data.token)
  const token = responseData.data.token;

  if (token) {
    // 4. Se guarda únicamente el token en localStorage
    localStorage.setItem("authToken", token);
  } else {
    // Se añade una validación por si el token no viene en la respuesta
    throw new Error("No se recibió un token en la respuesta del servidor.");
  }
}

export async function changePassword(oldPassword, newPassword) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No estás autenticado.");
  }

  const response = await fetch(`${API_URL_AUTH}/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error al cambiar la contraseña.");
  }
}

export function logout() {
  localStorage.removeItem("authToken");
  window.location.reload();
}

export function getAuthToken() {
  return localStorage.getItem("authToken");
}