import { Request, Response, NextFunction } from 'express';
import { ISlideService } from '../services/rbac/slide.service.interface';
import { SlideUploadResponse } from '../types/slide.dtos';

/**
 * Factory del controller de slides.
 * Recibe el servicio como dependencia para facilitar el testeo unitario.
 */
export const crearSlideController = (servicio: ISlideService) => ({
  /** GET /api/slides — público, devuelve los slides activos ordenados. */
  listar: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slides = await servicio.listarActivos();
      res.json(slides);
    } catch (error) {
      next(error);
    }
  },

  /** GET /api/slides/:id — público, detalle de un slide activo. */
  obtener: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slide = await servicio.obtenerPorId(req.params.id);
      if (!slide) {
        res.status(404).json({ message: 'Slide no encontrado' });
        return;
      }
      res.json(slide);
    } catch (error) {
      next(error);
    }
  },

  /** POST /api/slides — alta de slide con metadata (la URL ya viene resuelta). */
  crear: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const creado = await servicio.crear(req.body);
      res.status(201).json(creado);
    } catch (error) {
      next(error);
    }
  },

  /** PUT /api/slides/:id — actualización parcial. */
  actualizar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actualizado = await servicio.actualizar(req.params.id, req.body);
      if (!actualizado) {
        res.status(404).json({ message: 'Slide no encontrado' });
        return;
      }
      res.json(actualizado);
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /api/slides/:id — soft delete. */
  eliminar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eliminado = await servicio.eliminar(req.params.id);
      if (!eliminado) {
        res.status(404).json({ message: 'Slide no encontrado' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/slides/imagen — recibe un archivo via multipart, lo convierte
   * a un data URI base64 y lo devuelve. El cliente lo persiste después como
   * `imagen` del DTO al crear/actualizar el slide. La imagen vive enteramente
   * dentro del documento de Mongo, sin filesystem ni storage externo.
   */
  subirImagen: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No se recibió ningún archivo' });
        return;
      }
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const respuesta: SlideUploadResponse = { url: dataUri };
      res.status(201).json(respuesta);
    } catch (error) {
      next(error);
    }
  },
});
