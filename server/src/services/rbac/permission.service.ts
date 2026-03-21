import Permission, { IPermission } from "../../models/Permission";
import { PermisoResponseDto } from "../../types";
import { IPermissionService } from "../../types/rbac/permission.service.interface";

/**
 * Convierte un documento Mongoose al DTO de respuesta.
 * @param permiso - Documento del permiso desde MongoDB.
 * @returns DTO con los datos públicos del permiso.
 */
const mapearAResponseDto = (permiso: IPermission): PermisoResponseDto => ({
  id: permiso._id.toString(),
  nombre: permiso.nombre,
  recurso: permiso.recurso,
  accion: permiso.accion,
  descripcion: permiso.descripcion,
});

/**
 * Implementación del servicio de permisos.
 * Solo lectura — los permisos se gestionan mediante el seeder.
 */
export class PermissionService implements IPermissionService {
  /**
   * Obtiene todos los permisos registrados.
   * @returns Lista de permisos como DTOs de respuesta.
   */
  async obtenerTodos(): Promise<PermisoResponseDto[]> {
    const permisos = await Permission.find();
    return permisos.map(mapearAResponseDto);
  }

  /**
   * Obtiene un permiso por su ID.
   * @param id - ID del permiso a buscar.
   * @returns El permiso encontrado o null si no existe.
   */
  async obtenerPorId(id: string): Promise<PermisoResponseDto | null> {
    const permiso = await Permission.findById(id);
    if (!permiso) return null;
    return mapearAResponseDto(permiso);
  }
}