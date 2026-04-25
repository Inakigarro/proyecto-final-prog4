import { Types } from "mongoose";
import { CategoryResponseDto } from "./categories.dto";

export interface CrearItemDto {
  nombre: string;
  precioUnitario: number;
  category: Types.ObjectId[];
}

export interface ItemResponse {
  id: string;
  nombre: string;
  precioUnitario: number;
  category: CategoryResponseDto[];
}
