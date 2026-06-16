import {
  ActualizarSlideDto,
  CrearSlideDto,
  SlideResponse,
} from '../../types/slide.dtos';

/**
 * Contrato del servicio de slides del home.
 * Las queries del frontend público solo deben ver los slides activos;
 * el dashboard ve los activos (los inactivos se descartan vía soft delete).
 */
export interface ISlideService {
  /** Lista los slides activos ordenados por `orden` ascendente. */
  listarActivos(): Promise<SlideResponse[]>;
  /** Devuelve un slide por id si está activo; null si no existe. */
  obtenerPorId(id: string): Promise<SlideResponse | null>;
  crear(dto: CrearSlideDto): Promise<SlideResponse>;
  actualizar(id: string, dto: ActualizarSlideDto): Promise<SlideResponse | null>;
  /** Soft delete por id. Devuelve true si se eliminó, false si no existía. */
  eliminar(id: string): Promise<boolean>;
}
