import { Types } from "mongoose";
import { CategoryResponseDto } from "./categories.dto";

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
  precioUnitario: number;
  stock?: number;
  category: Types.ObjectId[];
}

export interface ItemResponse {
  id: string;
  nombre: string;
  descripcion?: string;
  precioUnitario: number;
  stock: number;
  category: CategoryResponseDto[];
}
