import Slide, { ISlide } from '../../models/Slide';
import {
  ActualizarSlideDto,
  CrearSlideDto,
  SlideResponse,
} from '../../types/slide.dtos';
import { ISlideService } from './slide.service.interface';

/**
 * Mapea un documento Mongoose al DTO público.
 */
const mapearAResponseDto = (slide: ISlide): SlideResponse => ({
  id: slide._id.toString(),
  imagen: slide.imagen,
  alt: slide.alt,
  leyenda: slide.leyenda,
  orden: slide.orden,
});

/**
 * Implementación del servicio de slides.
 * Todas las consultas filtran por `activo !== false` (los borrados lógicos no se ven).
 */
export class SlideService implements ISlideService {
  async listarActivos(): Promise<SlideResponse[]> {
    const slides = await Slide.find({ activo: { $ne: false } })
      .sort({ orden: 1, createdAt: 1 })
      .lean();
    return (slides as unknown as ISlide[]).map(mapearAResponseDto);
  }

  async obtenerPorId(id: string): Promise<SlideResponse | null> {
    const slide = await Slide.findOne({ _id: id, activo: { $ne: false } }).lean();
    return slide ? mapearAResponseDto(slide as unknown as ISlide) : null;
  }

  async crear(dto: CrearSlideDto): Promise<SlideResponse> {
    const slide = await Slide.create(dto);
    return mapearAResponseDto(slide);
  }

  async actualizar(
    id: string,
    dto: ActualizarSlideDto,
  ): Promise<SlideResponse | null> {
    const actualizado = await Slide.findOneAndUpdate(
      { _id: id, activo: { $ne: false } },
      dto,
      { new: true, runValidators: true },
    ).lean();
    return actualizado ? mapearAResponseDto(actualizado as unknown as ISlide) : null;
  }

  async eliminar(id: string): Promise<boolean> {
    const resultado = await Slide.findOneAndUpdate(
      { _id: id, activo: { $ne: false } },
      { activo: false },
    );
    return resultado !== null;
  }
}
