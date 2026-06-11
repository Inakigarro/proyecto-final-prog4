import {
  CrearPromotionDto,
  ActualizarPromotionDto,
  PromotionResponse,
} from '../promotion.dtos';
import { ItemResponse } from '../item.dtos';

/**
 * Contrato del servicio de promociones.
 * Los métodos exponen DTOs de respuesta, no documentos Mongoose crudos.
 */
export interface IPromotionService {
  /** Lista todas las promociones activas con su shape de respuesta. */
  buscarTodas(): Promise<PromotionResponse[]>;

  /** Obtiene una promoción activa por ID o null si no existe. */
  buscarPorId(id: string): Promise<PromotionResponse | null>;

  /** Crea una promoción. Valida coherencia tipo ↔ parametros. */
  crear(dto: CrearPromotionDto): Promise<PromotionResponse>;

  /** Actualiza parcialmente una promoción activa. Devuelve null si no existe. */
  actualizar(id: string, dto: ActualizarPromotionDto): Promise<PromotionResponse | null>;

  /** Borrado lógico. Devuelve true si existía y fue desactivada. */
  eliminar(id: string): Promise<boolean>;

  /**
   * Devuelve los productos asociados a una promoción, populados como ItemResponse.
   * Devuelve `null` si la promoción no existe; `[]` si existe pero no tiene productos.
   */
  obtenerProductosDePromocion(id: string): Promise<ItemResponse[] | null>;
}
