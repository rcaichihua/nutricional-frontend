// Se importa la constante directamente aquí para centralizar la configuración
import { API_URL_BASE } from "../config/constants";

// --- LÓGICA DE TOKEN ---
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

function logout() {
  localStorage.removeItem('authToken');
  window.location.replace('/login');
}
// --- FIN LÓGICA DE TOKEN ---


export async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    // Se construye la URL completa aquí, asegurando que API_URL_BASE siempre esté disponible
    const fullUrl = `${API_URL_BASE}${endpoint}`;

    const res = await fetch(fullUrl, {
      ...options,
      headers: headers,
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        console.error("Autenticación fallida. Redirigiendo al login...");
        logout();
      }
      const errorText = await res.text();
      throw new Error(errorText || `Error del servidor: ${res.status}`);
    }

    if (res.status === 204) {
      return null as any;
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return (await res.json()) as T;
    }

    return null as any;
  } catch (error) {
    console.error("Error en la llamada fetch:", error);
    throw error;
  }
}