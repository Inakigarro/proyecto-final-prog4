import { PermisoResponseDto } from "../index";

/**
 * Interfaz que define el comportamiento mínimo esperado
 * de cualquier implementación del servicio de permisos.
 * Los permisos se gestionan mediante el seeder, no desde la API.
 */
export interface IPermissionService {
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