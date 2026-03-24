import { CrearUsuarioDto, ActualizarUsuarioDto, UsuarioResponseDto } from "../index";

/**
 * Interfaz que define el comportamiento mínimo esperado
 * de cualquier implementación del servicio de usuarios.
 */
export interface IUserService {
  /**
   * Obtiene todos los usuarios con sus roles y permisos populados.
   * @returns Lista de usuarios como DTOs de respuesta.
   */
  obtenerTodos(): Promise<UsuarioResponseDto[]>;

  /**
   * Obtiene un usuario por su ID con roles y permisos populados.
   * @param id - ID del usuario a buscar.
   * @returns El usuario encontrado como DTO de respuesta, o null si no existe.
   */
  obtenerPorId(id: string): Promise<UsuarioResponseDto | null>;

  /**
   * Obtiene un usuario por su ID del JWT con roles y permisos populados.
   * @param id - ID del usuario autenticado.
   * @returns El usuario encontrado como DTO de respuesta, o null si no existe.
   */
  obtenerPerfil(id: string): Promise<UsuarioResponseDto | null>;

  /**
   * Crea un nuevo usuario en la base de datos.
   * @param dto - Datos necesarios para crear el usuario.
   * @returns El usuario creado como DTO de respuesta.
   */
  crear(dto: CrearUsuarioDto): Promise<UsuarioResponseDto>;

  /**
   * Actualiza un usuario existente por su ID.
   * @param id - ID del usuario a actualizar.
   * @param dto - Campos a actualizar.
   * @returns El usuario actualizado como DTO de respuesta, o null si no existe.
   */
  actualizar(id: string, dto: ActualizarUsuarioDto): Promise<UsuarioResponseDto | null>;

  /**
   * Elimina un usuario por su ID.
   * @param id - ID del usuario a eliminar.
   * @returns true si fue eliminado, false si no se encontró.
   */
  eliminar(id: string): Promise<boolean>;
}