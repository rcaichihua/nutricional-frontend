import { API_URL_BASE } from "../config/constants";

const API_URL_AUTH = `${API_URL_BASE}/auth`;

export async function login(username, password) {
  const response = await fetch(`${API_URL_AUTH}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Credenciales inválidas");
  }

  const token = await response.text();
  localStorage.setItem("authToken", token);
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
