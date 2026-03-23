import Role from "../../models/Role";
import { IRole } from "../../models/Role";
import { RolResponseDto, PermisoResponseDto } from "../../types";
import { IRoleService } from "../../types/rbac/role.service.interface";
import { IPermission } from "../../models/Permission";

/**
 * Convierte un documento Mongoose al DTO de respuesta.
 * @param rol - Documento del rol desde MongoDB con permisos populados.
 * @returns DTO con los datos públicos del rol.
 */
const mapearAResponseDto = (rol: IRole): RolResponseDto => ({
  id: rol._id.toString(),
  nombre: rol.nombre,
  descripcion: rol.descripcion,
  permisos: (rol.permisos as unknown as IPermission[]).map((p) => ({
    id: p._id.toString(),
    nombre: p.nombre,
    recurso: p.recurso,
    accion: p.accion,
    descripcion: p.descripcion,
  })),
});

/**
 * Implementación del servicio de roles.
 * Solo lectura — los roles se gestionan mediante el seeder.
 */
export class RoleService implements IRoleService {
  /**
   * Obtiene todos los roles con sus permisos populados.
   * @returns Lista de roles como DTOs de respuesta.
   */
  async obtenerTodos(): Promise<RolResponseDto[]> {
    const roles = await Role.find().populate('permisos');
    return roles.map(mapearAResponseDto);
  }

  /**
   * Obtiene un rol por su ID con sus permisos populados.
   * @param id - ID del rol a buscar.
   * @returns El rol encontrado o null si no existe.
   */
  async obtenerPorId(id: string): Promise<RolResponseDto | null> {
    const rol = await Role.findById(id).populate('permisos');
    if (!rol) return null;
    return mapearAResponseDto(rol);
  }
}