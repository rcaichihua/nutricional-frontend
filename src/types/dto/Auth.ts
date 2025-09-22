// src/types/dto/Auth.ts

/** Estructura estándar que devuelve tu backend */
export interface ApiResponse<T = unknown> {
  timestamp: string;           // ISO
  path: string;
  success: boolean;
  message?: string | null;
  code?: string | null;
  data: T;
  errors?: unknown;
}

/** Request del login */
export interface LoginRequest {
  username: string;
  password: string;
}

/** DTO liviano de sucursal que devuelve el backend en el login */
export interface SucursalLiteDTO {
  id: number;
  nombre: string;
}

/** Payload de autenticación que viene en ApiResponse.data */
export interface AuthPayload {
  token: string;
  tokenType: 'Bearer' | string;
  expiresAt: string;                 // el backend envía Instant -> ISO string
  username: string;
  roles: string[];

  // Campos añadidos para sucursales
  defaultSucursalId: number | null;  // puede venir null si no hay default
  sucursales: SucursalLiteDTO[];     // lista de {id, nombre}
}

/** Type guard opcional por si quieres validar en runtime */
export function isApiResponseAuth(
  v: unknown
): v is ApiResponse<AuthPayload> {
  if (!v || typeof v !== 'object') return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj.success === 'boolean' &&
    typeof obj.path === 'string' &&
    typeof obj.timestamp === 'string' &&
    obj.data !== undefined
  );
}
