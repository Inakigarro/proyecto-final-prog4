import { ActualizarPermisoDto, CrearPermisoDto, PermisoResponseDto } from "../index";

/**
 * Interfaz que define el comportamiento mínimo esperado
 * de cualquier implementación del servicio de permisos.
 */
export interface IPermissionService {
  /**
   * Crea un nuevo permiso en la base de datos.
   * @param dto - Datos necesarios para crear el permiso.
   * @returns El permiso creado como DTO de respuesta.
   */
  crear(dto: CrearPermisoDto): Promise<PermisoResponseDto>;

  /**
   * Actualiza un permiso existente por su ID.
   * @param id - ID del permiso a actualizar.
   * @param dto - Campos a actualizar.
   * @returns El permiso actualizado como DTO de respuesta, o null si no existe.
   */
  actualizar(id: string, dto: ActualizarPermisoDto): Promise<PermisoResponseDto | null>;

  /**
   * Elimina un permiso por su ID.
   * @param id - ID del permiso a eliminar.
   * @returns true si fue eliminado, false si no se encontró.
   */
  eliminar(id: string): Promise<boolean>;

  /**
   * Obtiene todos los permisos registrados.
   * @returns Lista de permisos como DTOs de respuesta.
   */
  obtenerTodos(): Promise<PermisoResponseDto[]>;

  /**
   * Obtiene un permiso por su ID.
   * @param id - ID del permiso a buscar.
   * @returns El permiso encontrado como DTO de respuesta, o null si no existe.
   */
  obtenerPorId(id: string): Promise<PermisoResponseDto | null>;
}