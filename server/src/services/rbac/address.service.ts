import Address, { IAddress } from '../../models/Address';
import { AddressResponseDto } from '../../types/address.dtos';
import { IAddressService } from './address.service.interface';

/**
 * Convierte un documento Mongoose al DTO de respuesta.
 * @param direccion - Documento de dirección obtenido de la BD.
 * @returns DTO con los datos públicos de la dirección.
 */
const mapearAResponseDto = (direccion: IAddress): AddressResponseDto => ({
  id: direccion._id.toString(),
  calle: direccion.calle,
  numero: direccion.numero,
  piso: direccion.piso,
  departamento: direccion.departamento,
  ciudad: direccion.ciudad,
  provincia: direccion.provincia,
  codigoPostal: direccion.codigoPostal,
});

/**
 * Implementación del servicio de direcciones.
 * Las consultas siempre filtran por activo=true (las eliminadas no se ven).
 */
export class AddressService implements IAddressService {
  /**
   * Lista las direcciones activas de un usuario, ordenadas por más reciente primero.
   * @param usuarioId - ID del usuario dueño de las direcciones.
   */
  async obtenerPorUsuario(usuarioId: string): Promise<AddressResponseDto[]> {
    const direcciones = await Address.find({ usuario: usuarioId, activo: { $ne: false } })
      .sort({ createdAt: -1 })
      .lean();
    return (direcciones as unknown as IAddress[]).map(mapearAResponseDto);
  }

  /**
   * Borra lógicamente una dirección verificando que pertenezca al usuario.
   * El filtro por usuario evita que un usuario pueda eliminar direcciones ajenas.
   * @param addressId - ID de la dirección a eliminar.
   * @param usuarioId - ID del usuario autenticado.
   * @returns true si se desactivó, false si no se encontró o no es del usuario.
   */
  async eliminar(addressId: string, usuarioId: string): Promise<boolean> {
    const resultado = await Address.findOneAndUpdate(
      { _id: addressId, usuario: usuarioId, activo: { $ne: false } },
      { activo: false }
    );
    return resultado !== null;
  }
}
