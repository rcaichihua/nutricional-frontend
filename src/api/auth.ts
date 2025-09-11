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

  // 3. Se extrae el token y el username de la ruta correcta (data.token y data.username)
  const { token, username: loggedInUsername } = responseData.data;

  if (token && loggedInUsername) {
    // 4. Se guardan ambos datos en localStorage
    localStorage.setItem("authToken", token);
    localStorage.setItem("username", loggedInUsername);
  } else {
    // Se añade una validación por si faltan datos en la respuesta
    throw new Error("No se recibió un token o nombre de usuario en la respuesta del servidor.");
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
  // Se elimina también el nombre de usuario al cerrar sesión
  localStorage.removeItem("authToken");
  localStorage.removeItem("username");
  window.location.reload();
}

export function getAuthToken() {
  return localStorage.getItem("authToken");
}

export function getUsername() {
  return localStorage.getItem("username");
}