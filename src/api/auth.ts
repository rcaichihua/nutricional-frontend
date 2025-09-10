import { API_URL_BASE } from "../config/constants";

const API_URL_AUTH = `${API_URL_BASE}/auth`;

export async function login(username, password) {
  const response = await fetch(`${API_URL_AUTH}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const responseData = await response.json();

  if (!response.ok || !responseData.success) {
    throw new Error(responseData.message || "Credenciales inválidas");
  }

  const { token, username: loggedInUsername } = responseData.data;

  if (token && loggedInUsername) {
    // --- NUEVO: Se guardan tanto el token como el nombre de usuario ---
    localStorage.setItem("authToken", token);
    localStorage.setItem("username", loggedInUsername);
  } else {
    throw new Error("No se recibió un token o nombre de usuario en la respuesta del servidor.");
  }
}

// ... (tu función changePassword se mantiene igual) ...
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
  // --- NUEVO: Se elimina también el nombre de usuario al cerrar sesión ---
  localStorage.removeItem("authToken");
  localStorage.removeItem("username");
  window.location.reload();
}

export function getAuthToken() {
  return localStorage.getItem("authToken");
}

// --- NUEVO: Función para obtener el nombre de usuario guardado ---
export function getUsername() {
  return localStorage.getItem("username");
}