export interface Receta {
  recetaId: number;
  nombre: string;
  descripcion: string | null;
  instrucciones?: string | null;
  tiempoPreparacionMinutos?: number | null;
  porciones: number;
  fechaCreacion?: string | null;
  usuarioCreacion?: string | null;
  fechaModificacion?: string | null;
  usuarioModificacion?: string | null;
  estado: string;
  insumos: RecetaInsumoDetalleDTO[];
  energiaKcalTotal: number;
  aguaGTotal: number;
  proteinaAnimalGTotal: number;
  proteinaVegetalGTotal: number;
  nitrogenoAnimalGTotal: number;
  nitrogenoVegetalGTotal: number;
  grasaAnimalGTotal: number;
  grasaVegetalGTotal: number;
  choCarbohidratoGTotal: number;
  fibraGTotal: number;
  calcioAnimalMgTotal: number;
  calcioVegetalMgTotal: number;
  fosforoMgTotal: number;
  hierroHemMgTotal: number;
  hierroNoHemMgTotal: number;
  retinolMcgTotal: number;
  vitaminaB1TiaminaMgTotal: number;
  vitaminaB2RiboflavinaMgTotal: number;
  niacinaMgTotal: number;
  vitaminaCMgTotal: number;
  sodioMgTotal: number;
  potasioMgTotal: number;
  proteinaTotalG: number;
  grasaTotalG: number;
  hierroTotalMg: number;
}

export interface RecetaInsumoDetalleDTO {
  insumoId: number;
  cantidad: number;
  unidadMedida: string | null;
  nombreInsumo: string;
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
