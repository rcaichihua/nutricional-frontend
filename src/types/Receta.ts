export interface Receta {
  id?: number;
  nombre: string;
  descripcion?: string;
  fechaCreacion?: string; // Usamos string para fechas en TS, puede ser Date si se prefiere
  usuarioCreacion?: string;
  fechaActualizacion?: string;
  usuarioActualizacion?: string;
}
