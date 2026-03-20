import Permission, { IPermission } from "../../models/Permission";
import { ActualizarPermisoDto, CrearPermisoDto, PermisoResponseDto } from "../../types";
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
 * Contiene la lógica de negocio para las operaciones CRUD sobre permisos.
 */
export class PermissionService implements IPermissionService {
  /**
   * Crea un nuevo permiso en la base de datos.
   * @param dto - Datos del permiso a crear.
   * @returns El permiso creado como DTO de respuesta.
   */
  async crear(dto: CrearPermisoDto): Promise<PermisoResponseDto> {
    const permiso = await Permission.create(dto);
    return mapearAResponseDto(permiso);
  }

  /**
   * Actualiza un permiso existente por su ID.
   * @param id - ID del permiso a actualizar.
   * @param dto - Campos a actualizar.
   * @returns El permiso actualizado o null si no existe.
   */
  async actualizar(id: string, dto: ActualizarPermisoDto): Promise<PermisoResponseDto | null> {
    const permiso = await Permission.findByIdAndUpdate(id, dto, { new: true, runValidators: true });
    if (!permiso) return null;
    return mapearAResponseDto(permiso);
  }

  /**
   * Elimina un permiso por su ID.
   * @param id - ID del permiso a eliminar.
   * @returns true si fue eliminado, false si no se encontró.
   */
  async eliminar(id: string): Promise<boolean> {
    const resultado = await Permission.findByIdAndDelete(id);
    return resultado !== null;
  }

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