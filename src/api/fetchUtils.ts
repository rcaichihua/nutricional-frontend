import { API_URL_BASE } from "../config/constants";

function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}
function logout() {
  localStorage.removeItem("authToken");
  window.location.replace("/login");
}

type ApiResponseShape<T> = {
  timestamp?: string;
  path?: string;
  success?: boolean;
  message?: string | null;
  code?: string | null;
  data?: T | null;
  errors?: unknown;
};

export async function fetchJson<T = any>(
  endpoint: string,
  init?: RequestInit
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const fullUrl = `${API_URL_BASE}${endpoint}`;

  try {
    const res = await fetch(fullUrl, { ...init, headers });

    if (res.status === 204) return null as any;

    const isJson = res.headers.get("content-type")?.includes("application/json");
    const payload: any = isJson ? await res.json() : await res.text();

    if (res.status === 401 || res.status === 403) {
      console.error("Autenticación fallida. Redirigiendo al login…");
      logout();
      throw new Error("No autorizado");
    }

    if (!res.ok) {
      const errBody = isJson ? (payload as ApiResponseShape<any>) : null;
      const message =
        (errBody?.message as string) ||
        (typeof payload === "string" ? payload : "") ||
        `Error del servidor: ${res.status}`;
      throw new Error(
        JSON.stringify({
          timestamp: errBody?.timestamp,
          path: errBody?.path ?? endpoint,
          success: false,
          message,
          code: errBody?.code ?? `HTTP_${res.status}`,
          data: errBody?.data ?? null,
          errors: errBody?.errors ?? null,
        })
      );
    }

    if (isJson) {
      const body = payload as ApiResponseShape<T> | T;
      if (typeof body === "object" && body !== null && "success" in body && "data" in body) {
        const api = body as ApiResponseShape<T>;
        if (api.success === false) {
          throw new Error(
            JSON.stringify({
              timestamp: api.timestamp,
              path: api.path ?? endpoint,
              success: false,
              message: api.message || "Ocurrió un error inesperado.",
              code: api.code ?? "INTERNAL_ERROR",
              data: api.data ?? null,
              errors: api.errors ?? null,
            })
          );
        }
        return (api.data as T) ?? (null as any);
      }
      return body as T;
    }

    return null as any;
  } catch (err) {
    // 👇 Log centralizado, y re-lanzamos para que el caller decida (toast, etc.)
    console.error("fetchJson error:", err);
    throw err;
  }
}
