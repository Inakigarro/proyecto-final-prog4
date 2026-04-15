import { Types } from "mongoose";
import { CategoryResponse } from "./categories.dto";

export interface CrearProductoDto {
  nombre: string;
  precioUnitario: number;
  category: Types.ObjectId;
}

export interface ProductoResponse {
  id: string;
  nombre: string;
  precioUnitario: number;
  category: CategoryResponse | null;
}