import { CrearCategoryDto, ActualizarCategoryDto, CategoryResumenDto, CategoryDetalleDto } from '../categories.dto';

/**
 * Contrato del servicio de categorías.
 * Nota: los métodos exponen DTOs de respuesta, no documentos Mongoose crudos.
 */
export interface ICategoryService {
  /** Crea una nueva categoría. Devuelve el resumen (sin items internos). */
  crear(dto: CrearCategoryDto): Promise<CategoryResumenDto>;

  /** Actualiza una categoría activa por ID. Devuelve null si no existe. */
  actualizar(id: string, dto: ActualizarCategoryDto): Promise<CategoryResumenDto | null>;

  /** Borrado lógico. Devuelve true si existía y fue desactivada. */
  eliminar(id: string): Promise<boolean>;

  /**
   * Lista todas las categorías activas.
   * Devuelve únicamente el resumen (id, nombre, cantidadItems) sin el array de items
   * para evitar respuestas demasiado pesadas.
   */
  buscarTodas(): Promise<CategoryResumenDto[]>;

  /**
   * Obtiene una categoría activa por ID con sus items resumidos.
   * Devuelve null si no existe o está inactiva.
   */
  buscarPorId(id: string): Promise<CategoryDetalleDto | null>;
}
