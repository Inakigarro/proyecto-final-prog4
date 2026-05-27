import { Types } from "mongoose";

export interface CrearCategoryDto {
  nombre: string;
  items: Types.ObjectId[];
}

export interface ActualizarCategoryDto {
  nombre?: string;
  items?: Types.ObjectId[];
}

/**
 * DTO liviano para embeber en otras entidades (p.ej. en ItemResponse)
 * y para el listado de categorías.
 * No expone el array de items para evitar profundidad innecesaria.
 */
export interface CategoryResumenDto {
  id: string;
  nombre: string;
  cantidadItems: number;
}

/**
 * DTO de resumen de un item, para incluir dentro del detalle de una categoría.
 * No incluye las categorías del item para evitar referencias circulares.
 */
export interface ItemEnCategoriaDto {
  id: string;
  nombre: string;
  precioUnitario: number;
}

/**
 * DTO de detalle para GET /api/categories/:id.
 * Incluye el listado resumido de items sin nested depth.
 */
export interface CategoryDetalleDto extends CategoryResumenDto {
  items: ItemEnCategoriaDto[];
}
