import { ObjectId, Types } from "mongoose";

export interface CrearCategoryDto {
    nombre: string;
    items: Types.ObjectId[];
    }

export interface CategoryResponse {
    id: Types.ObjectId;
    nombre: string;
    items: Types.ObjectId[];
}