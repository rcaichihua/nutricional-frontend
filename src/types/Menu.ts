import { RecetaConInsumosDTO } from "./Receta";

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

export interface MenuRecetasInsumosDTO {
	menuId: number;
	fechaMenu: string;
	nombreMenu: string;
	descripcion: string;
	tipoMenu: string;
	estado: string;
  recetas: RecetaConInsumosDTO[];
}
