import { API_URL_BASE } from '../config/constants';
import type { ApiResponse, AuthPayload, LoginRequest } from '../types/dto/Auth';
// crea este archivo si aún no existe (te di el contenido antes)

const API_URL_AUTH = `${API_URL_BASE}/auth`;

// claves en localStorage
const AUTH_KEY = 'auth';            // payload completo
const TOKEN_KEY = 'authToken';      // compatibilidad con código existente
const USER_KEY = 'username';        // compatibilidad
const SID_KEY = 'sucursalId';       // sucursal seleccionada

/** Helpers de almacenamiento */
export function getAuth(): AuthPayload | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthPayload) : null;
  } catch {
    return null;
  }
}
export function setAuth(payload: AuthPayload | null) {
  if (payload) localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
  else localStorage.removeItem(AUTH_KEY);
}
export function getAuthToken(): string | null {
  const t = localStorage.getItem(TOKEN_KEY);
  if (t) return t;
  const a = getAuth();
  return a?.token ?? null;
}
export function getUsername(): string | null {
  const u = localStorage.getItem(USER_KEY);
  if (u) return u;
  const a = getAuth();
  return a?.username ?? null;
}
export function getSucursalId(): number | null {
  const v = localStorage.getItem(SID_KEY);
  return v ? Number(v) : null;
}
export function setSucursalId(id: number) {
  localStorage.setItem(SID_KEY, String(id));
}

/** POST /api/auth/login */
export async function login(
  username: string,
  password: string
): Promise<AuthPayload> {
  const body: LoginRequest = { username, password };

  const response = await fetch(`${API_URL_AUTH}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const responseData = (await response.json()) as ApiResponse<AuthPayload>;

  if (!response.ok || !responseData.success) {
    throw new Error(responseData.message || 'Credenciales inválidas');
  }

  const payload = responseData.data;

  // ✅ Guardamos el payload completo y también las claves antiguas para compatibilidad
  setAuth(payload);
  localStorage.setItem(TOKEN_KEY, payload.token);
  localStorage.setItem(USER_KEY, payload.username);

  // ✅ Determinar sucursal activa (default o la primera disponible) y guardarla
  const selected =
    payload.defaultSucursalId ??
    (payload.sucursales?.length ? payload.sucursales[0].id : null);

  if (selected !== null && selected !== undefined) {
    setSucursalId(selected);
  } else {
    localStorage.removeItem(SID_KEY);
  }

  return payload;
}

/** POST /api/auth/change-password */
export async function changePassword(oldPassword: string, newPassword: string) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No estás autenticado.');
  }

  const response = await fetch(`${API_URL_AUTH}/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  if (!response.ok) {
    // El backend suele devolver texto en este endpoint
    const errorText = await response.text();
    throw new Error(errorText || 'Error al cambiar la contraseña.');
  }
}

/** Limpia todo y recarga */
export function logout() {
  setAuth(null);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SID_KEY);
  window.location.reload();
}
