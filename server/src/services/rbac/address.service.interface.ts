import { AddressResponseDto, CrearAddressDto } from '../../types/address.dtos';

/**
 * Contrato del servicio de direcciones.
 * Maneja listado, eliminación lógica, alta con dedupe contra direcciones
 * existentes y verificación de propiedad (usado por checkout).
 */
export interface IAddressService {
  /** Lista las direcciones activas asociadas a un usuario. */
  obtenerPorUsuario(usuarioId: string): Promise<AddressResponseDto[]>;

  /**
   * Borra lógicamente una dirección si pertenece al usuario indicado.
   * Devuelve true si fue eliminada, false si no existe o no le pertenece.
   */
  eliminar(addressId: string, usuarioId: string): Promise<boolean>;

  /**
   * Crea una dirección para el usuario, o reutiliza una existente si los
   * campos coinciden (match case-insensitive sobre los strings, opcionales
   * incluidos). Es idempotente: invocarlo dos veces con los mismos datos
   * devuelve la misma dirección.
   *
   * @param usuarioId - Id del usuario dueño de la dirección.
   * @param datos - Campos de la dirección a crear o buscar.
   * @returns El DTO de la dirección creada o reutilizada.
   */
  crearODedup(usuarioId: string, datos: CrearAddressDto): Promise<AddressResponseDto>;

  /**
   * Verifica que una dirección activa pertenezca al usuario y la devuelve.
   * Útil para que el checkout valide cuando el cliente referencia una
   * dirección por id en lugar de crear una nueva.
   *
   * @returns El DTO de la dirección si pertenece al usuario y está activa; null si no.
   */
  obtenerPorIdYUsuario(addressId: string, usuarioId: string): Promise<AddressResponseDto | null>;
}
