import Address, { IAddress } from '../../models/Address';
import { AddressResponseDto, CrearAddressDto } from '../../types/address.dtos';
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
 * Normaliza un campo string para matching: trim + lowercase.
 * Undefined queda como string vacío para que dos direcciones sin piso
 * (por ejemplo) sigan considerándose iguales.
 */
const normalizar = (valor?: string): string => (valor ?? '').trim().toLowerCase();

/**
 * Comparador de igualdad entre los datos pedidos y un documento Address ya
 * persistido. Match case-insensitive con trim sobre todos los campos string.
 */
function coincide(datos: CrearAddressDto, doc: IAddress): boolean {
  return (
    normalizar(datos.calle) === normalizar(doc.calle) &&
    normalizar(datos.numero) === normalizar(doc.numero) &&
    normalizar(datos.piso) === normalizar(doc.piso) &&
    normalizar(datos.departamento) === normalizar(doc.departamento) &&
    normalizar(datos.ciudad) === normalizar(doc.ciudad) &&
    normalizar(datos.provincia) === normalizar(doc.provincia) &&
    normalizar(datos.codigoPostal) === normalizar(doc.codigoPostal)
  );
}

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

  /**
   * Crea una dirección o reutiliza una existente del usuario que matchee
   * exactamente los datos. La comparación es case-insensitive y trimmed.
   *
   * No usa un índice único de Mongo para evitar problemas con campos opcionales
   * y normalización; el match se hace en memoria sobre el set del usuario,
   * que en la práctica es chico (decenas, no miles).
   */
  async crearODedup(usuarioId: string, datos: CrearAddressDto): Promise<AddressResponseDto> {
    const activas = await Address.find({ usuario: usuarioId, activo: { $ne: false } });
    const existente = (activas as unknown as IAddress[]).find((doc) => coincide(datos, doc));
    if (existente) return mapearAResponseDto(existente);

    const nueva = await Address.create({
      usuario: usuarioId,
      calle: datos.calle.trim(),
      numero: datos.numero.trim(),
      piso: datos.piso?.trim() || undefined,
      departamento: datos.departamento?.trim() || undefined,
      ciudad: datos.ciudad.trim(),
      provincia: datos.provincia.trim(),
      codigoPostal: datos.codigoPostal.trim(),
    });
    return mapearAResponseDto(nueva);
  }

  /**
   * Devuelve la dirección si está activa y pertenece al usuario.
   * Usado por el checkout cuando el cliente referencia una dirección por id.
   */
  async obtenerPorIdYUsuario(
    addressId: string,
    usuarioId: string,
  ): Promise<AddressResponseDto | null> {
    const direccion = await Address.findOne({
      _id: addressId,
      usuario: usuarioId,
      activo: { $ne: false },
    });
    return direccion ? mapearAResponseDto(direccion as unknown as IAddress) : null;
  }
}
