export interface Menu {
  menuId: number;
  nombreMenu: string;
  fechaMenu: string;
  descripcion: string | null;
  tipoMenu: string;
  fechaCreacion: string | null;
  usuarioCreacion: string | null;
  fechaModificacion: string | null;
  usuarioModificacion: string | null;
  estado: string;
  recetas: MenuReceta[];
  energiaKcalTotal: number | null;
  proteinaTotalG: number | null;
}

export interface MenuReceta {
  recetaId: number;
  tipoComida: string;
  orden: number;
  nombreReceta: string;
}