export interface Receta {
  id?: number;
  nombre: string;
  descripcion?: string;
  fechaCreacion?: string; // Usamos string para fechas en TS, puede ser Date si se prefiere
  usuarioCreacion?: string;
  fechaActualizacion?: string;
  usuarioActualizacion?: string;
}

export interface RecetaInsumoDetalleDTO {
  insumoId: number;
  nombreInsumo: string;
  cantidadEnReceta: number;
  energiaKcalPor100g: number;
  proteinaAnimalGPor100g: number;
  proteinaVegetalGPor100g: number;
  choCarbohidratoGPor100g: number;
}

export interface RecetaConInsumosDTO {
  recetaId: number;
  nombre: string;
  descripcion: string;
  porciones: number;
  tipoComida: string;
  orden: number;
  insumos: RecetaInsumoDetalleDTO[];
}
