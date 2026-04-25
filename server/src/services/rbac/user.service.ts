import User, { IUser } from "../../models/User";
import { CrearUsuarioDto, ActualizarUsuarioDto, UsuarioResponseDto, RolResponseDto } from "../../types";
import { IUserService } from "../../types/rbac/user.service.interface";
import { IRole } from "../../models/Role";
import { IPermission } from "../../models/Permission";

/** Opciones de populate para roles y permisos anidados */
const POPULATE_ROLES = { path: 'roles', populate: { path: 'permisos' } };

/**
 * Convierte un documento Mongoose al DTO de respuesta.
 * @param usuario - Documento del usuario desde MongoDB con roles populados.
 * @returns DTO con los datos públicos del usuario sin contraseña.
 */
const mapearAResponseDto = (usuario: IUser): UsuarioResponseDto => ({
  id: usuario._id.toString(),
  nombre: usuario.nombre,
  apellido: usuario.apellido,
  fechaNacimiento: usuario.fechaNacimiento,
  email: usuario.email,
  activo: usuario.activo,
  roles: (usuario.roles as unknown as IRole[]).map((rol) => ({
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
  })),
});

/**
 * Implementación del servicio de usuarios.
 * Contiene la lógica de negocio para las operaciones CRUD sobre usuarios.
 */
export class UserService implements IUserService {
  /**
   * Obtiene todos los usuarios con sus roles y permisos populados.
   * @returns Lista de usuarios como DTOs de respuesta.
   */
  async obtenerTodos(): Promise<UsuarioResponseDto[]> {
    const usuarios = await User.find().populate(POPULATE_ROLES);
    return usuarios.map(mapearAResponseDto);
  }

  /**
   * Obtiene un usuario por su ID con roles y permisos populados.
   * @param id - ID del usuario a buscar.
   * @returns El usuario encontrado o null si no existe.
   */
  async obtenerPorId(id: string): Promise<UsuarioResponseDto | null> {
    const usuario = await User.findById(id).populate(POPULATE_ROLES);
    if (!usuario) return null;
    return mapearAResponseDto(usuario);
  }

  /**
   * Obtiene el perfil del usuario autenticado con roles y permisos populados.
   * @param id - ID del usuario extraído del JWT.
   * @returns El usuario encontrado o null si no existe.
   */
  async obtenerPerfil(id: string): Promise<UsuarioResponseDto | null> {
    const usuario = await User.findById(id).populate(POPULATE_ROLES);
    if (!usuario) return null;
    return mapearAResponseDto(usuario);
  }

  /**
   * Crea un nuevo usuario en la base de datos.
   * @param dto - Datos del usuario a crear.
   * @returns El usuario creado como DTO de respuesta.
   */
  async crear(dto: CrearUsuarioDto): Promise<UsuarioResponseDto> {
    const usuario = await User.create(dto);
    // Popular roles después de crear para devolver datos completos
    await usuario.populate(POPULATE_ROLES);
    return mapearAResponseDto(usuario);
  }

  /**
   * Actualiza un usuario existente por su ID.
   * Si se envía password, usa save() para disparar el pre-hook de hasheo.
   * @param id - ID del usuario a actualizar.
   * @param dto - Campos a actualizar.
   * @returns El usuario actualizado o null si no existe.
   */
  async actualizar(id: string, dto: ActualizarUsuarioDto): Promise<UsuarioResponseDto | null> {
    // Si se envía password hay que usar save() para que se hashee correctamente
    if (dto.password) {
      const usuario = await User.findById(id).select('+password');
      if (!usuario) return null;
      Object.assign(usuario, dto);
      await usuario.save();
      await usuario.populate(POPULATE_ROLES);
      return mapearAResponseDto(usuario);
    }

    const usuario = await User.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    }).populate(POPULATE_ROLES);

    if (!usuario) return null;
    return mapearAResponseDto(usuario);
  }

  /**
   * Elimina un usuario por su ID.
   * @param id - ID del usuario a eliminar.
   * @returns true si fue eliminado, false si no se encontró.
   */
  async eliminar(id: string): Promise<boolean> {
    const resultado = await User.findByIdAndDelete(id);
    return resultado !== null;
  }
}