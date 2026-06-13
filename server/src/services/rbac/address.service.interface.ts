import { AddressResponseDto } from '../../types/address.dtos';

/**
 * Contrato del servicio de direcciones.
 * Por ahora solo se soporta listar las direcciones de un usuario y
 * eliminarlas. Alta y edición se sumarán cuando el flujo de checkout
 * lo requiera.
 */
export interface IAddressService {
  /** Lista las direcciones activas asociadas a un usuario. */
  obtenerPorUsuario(usuarioId: string): Promise<AddressResponseDto[]>;

  /**
   * Borra lógicamente una dirección si pertenece al usuario indicado.
   * Devuelve true si fue eliminada, false si no existe o no le pertenece.
   */
  eliminar(addressId: string, usuarioId: string): Promise<boolean>;
}
