/**
 * Tipos compartidos de la página de detalle de producto (PDP).
 *
 * Se mantienen en un archivo separado para que todos los subcomponentes
 * importen desde un único lugar y el refactor sea sencillo cuando el
 * backend agregue nuevos campos al modelo.
 */

/** Categoría de producto tal como la devuelve el backend (populada). */
export interface Categoria {
  id: string;
  nombre: string;
  /** IDs de los ítems que pertenecen a esta categoría. */
  items: string[];
}

/**
 * Producto completo, resultado de GET /api/products/:id o de la lista.
 *
 * Los campos `imageSrc` y `cucarda` no existen aún en el modelo del backend;
 * se declaran opcionales para estar listos cuando se agreguen.
 */
export interface Producto {
  id: string;
  nombre: string;
  precioUnitario: number;
  /** URL de la imagen principal del producto. */
  imageSrc?: string;
  /** Texto promocional breve (ej. "Cuotas sin interés"). */
  cucarda?: string;
  category: Categoria[];
}
