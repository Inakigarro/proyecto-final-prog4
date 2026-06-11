import { Types } from 'mongoose';

/**
 * Tipos de promoción soportados (mismo enum que el modelo).
 */
export type TipoPromocion = 'DESCUENTO_PORCENTUAL' | 'NXM' | 'SEGUNDA_UNIDAD';

export interface ParametrosPromocionDto {
  porcentaje?: number;
  cantidadLleva?: number;
  cantidadPaga?: number;
  descuentoSegundaUnidad?: number;
}

export interface CrearPromotionDto {
  nombre: string;
  tipo: TipoPromocion;
  parametros: ParametrosPromocionDto;
  productos: (string | Types.ObjectId)[];
}

export interface ActualizarPromotionDto {
  nombre?: string;
  tipo?: TipoPromocion;
  parametros?: ParametrosPromocionDto;
  productos?: (string | Types.ObjectId)[];
  activo?: boolean;
}

/**
 * Forma de respuesta acordada con el frontend.
 * Claves específicas (idPromocion, nombrePromocion, idsProductos) en vez del shape genérico.
 */
export interface PromotionResponse {
  idPromocion: string;
  nombrePromocion: string;
  tipoPromocion: TipoPromocion;
  parametros: ParametrosPromocionDto;
  idsProductos: string[];
}
