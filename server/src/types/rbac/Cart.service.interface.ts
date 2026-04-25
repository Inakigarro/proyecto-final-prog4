import {
  ValidarCarritoDto,
  ValidacionCarritoResponse,
  CheckoutDto,
  CheckoutResponse,
} from '../cart.dtos';

/**
 * Contrato del servicio de carrito.
 */
export interface ICartService {
  /**
   * Valida los items del carrito contra la base de datos:
   * verifica existencia, devuelve precios actuales, stock disponible
   * y calcula el total. No persiste nada.
   */
  validateCart(dto: ValidarCarritoDto): Promise<ValidacionCarritoResponse>;

  /**
   * Confirma la compra: valida items, descuenta stock de forma atómica
   * y crea la PurchaseOrder con sus PurchaseOrderDetail.
   */
  checkout(usuarioId: string, dto: CheckoutDto): Promise<CheckoutResponse>;
}