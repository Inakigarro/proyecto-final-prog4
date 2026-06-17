/**
 * Tipos compartidos de la página de detalle de producto (PDP).
 *
 * Se mantienen en un archivo separado para que todos los subcomponentes
 * importen desde un único lugar y el refactor sea sencillo cuando el
 * backend agregue nuevos campos al modelo.
 */

/**
 * Categoría de producto tal como la devuelve el backend (CategoryResumenDto).
 * Nota: el backend ya no expone el array de items, solo la cantidad.
 */
export interface Categoria {
  id: string;
  nombre: string;
  cantidadItems: number;
}

/**
 * Producto completo, resultado de GET /api/products/:id o de la lista.
 *
 * El campo `cucarda` se calcula en el frontend según la promoción aplicable;
 * no viene del backend.
 */
export interface Producto {
  id: string;
  nombre: string;
  precioUnitario: number;
  descripcion?: string;
  /** URL pública de la imagen principal del producto. */
  imagen?: string;
  /** Texto promocional breve (ej. "Cuotas sin interés"). */
  cucarda?: string;
  /** Unidades disponibles en stock. */
  stock?: number;
  category: Categoria[];
}
