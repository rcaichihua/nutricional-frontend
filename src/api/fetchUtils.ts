import { getAuthToken, logout } from "../api/auth";

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  // Obtiene el token de autenticación
  const token = getAuthToken();

  // Prepara los encabezados de la solicitud
  const headers = {
    ...options?.headers,
  };

  // Si existe un token, lo adjunta al encabezado Authorization
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers: headers, // Usa los headers actualizados
    });

    if (!res.ok) {
      // Si la respuesta es 401, el token es inválido o no existe.
      if (res.status === 401) {
        console.error("Autenticación fallida. Redirigiendo al login...");
        logout();
      }
      const errorText = await res.text();
      throw new Error(errorText || `Error ${res.status}`);
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return (await res.json()) as T;
    }

    return null as any;
  } catch (error) {
    throw error;
  }
}