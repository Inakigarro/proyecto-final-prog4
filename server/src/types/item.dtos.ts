import { Types } from "mongoose";
import { CategoryResumenDto } from "./categories.dto";

export interface FiltrosProducto {
  q?: string;
  pagina?: number;
  limite?: number;
}

export interface ProductosPageResponse {
  datos: ItemResponse[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface CrearItemDto {
  nombre: string;
  descripcion?: string;
  /** URL pública de la imagen principal del producto. */
  imagen?: string;
  precioUnitario: number;
  stock?: number;
  category: Types.ObjectId[];
}

export interface ItemResponse {
  id: string;
  nombre: string;
  descripcion?: string;
  /** URL pública de la imagen principal del producto. */
  imagen?: string;
  precioUnitario: number;
  stock: number;
  /** Categorías del producto en formato resumido (sin el array de items de cada categoría). */
  category: CategoryResumenDto[];
}
