import { CrearCategoryDto, ActualizarCategoryDto, CategoryResponseDto } from '../categories.dto';

/**
 * Contrato del servicio de categorías.
 * Nota: los métodos exponen DTOs de respuesta, no documentos Mongoose crudos.
 */
export interface ICategoryService {
  /** Crea una nueva categoría */
  crear(dto: CrearCategoryDto): Promise<CategoryResponseDto>;

  /** Actualiza una categoría activa por ID. Devuelve null si no existe. */
  actualizar(id: string, dto: ActualizarCategoryDto): Promise<CategoryResponseDto | null>;

  /** Borrado lógico. Devuelve true si existía y fue desactivada. */
  eliminar(id: string): Promise<boolean>;

  /** Lista todas las categorías activas con sus items populados */
  buscarTodasConItems(): Promise<CategoryResponseDto[]>;

  /** Obtiene una categoría activa por ID con sus items populados. Devuelve null si no existe. */
  buscarPorIdConItems(id: string): Promise<CategoryResponseDto | null>;
}
