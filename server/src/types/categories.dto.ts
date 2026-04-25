import { Types } from "mongoose";

export interface CrearCategoryDto {
  nombre: string;
  items: Types.ObjectId[];
}

export interface ActualizarCategoryDto {
  nombre?: string;
  items?: Types.ObjectId[];
}

export interface CategoryResponseDto {
  id: string;
  nombre: string;
  items: string[];
}

export interface CategoryResponse {
  id: Types.ObjectId;
  nombre: string;
  items: Types.ObjectId[];
}