import { RolResponseDto } from "../index";

/**
 * Interfaz que define el comportamiento mínimo esperado
 * de cualquier implementación del servicio de roles.
 * Los roles se gestionan mediante el seeder, no desde la API.
 */
export interface IRoleService {
  /**
   * Obtiene todos los roles con sus permisos populados.
   * @returns Lista de roles como DTOs de respuesta.
   */
  obtenerTodos(): Promise<RolResponseDto[]>;

  /**
   * Obtiene un rol por su ID con sus permisos populados.
   * @param id - ID del rol a buscar.
   * @returns El rol encontrado como DTO de respuesta, o null si no existe.
   */
  obtenerPorId(id: string): Promise<RolResponseDto | null>;
}