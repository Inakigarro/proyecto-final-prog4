import { Request, Response, NextFunction } from "express";
import { ICategoryService } from "../types/rbac/category.service.interface";
import { CrearCategoryDto, ActualizarCategoryDto } from "../types/categories.dto";

/**
 * Factory del controller de categorías.
 * Recibe el servicio como dependencia para facilitar el testeo unitario.
 */
export const crearCategoryController = (servicio: ICategoryService) => ({

  /** Devuelve todas las categorías activas con su cantidad de items */
  listar: async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const categorias = await servicio.buscarTodas();
      res.json(categorias);
    } catch (error) {
      next(error);
    }
  },

  /** Devuelve una categoría por ID con sus items resumidos (id, nombre, precioUnitario) */
  obtenerPorId: async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const categoria = await servicio.buscarPorId(req.params.id);
      if (!categoria) {
        res.status(404).json({ message: "Categoría no encontrada" });
        return;
      }
      res.json(categoria);
    } catch (error) {
      next(error);
    }
  },

  /** Crea una nueva categoría */
  crear: async (
    req: Request<{}, {}, CrearCategoryDto>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const categoria = await servicio.crear(req.body);
      res.status(201).json(categoria);
    } catch (error) {
      next(error);
    }
  },

  /** Actualiza parcialmente una categoría por ID */
  actualizar: async (
    req: Request<{ id: string }, {}, ActualizarCategoryDto>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const categoria = await servicio.actualizar(req.params.id, req.body);
      if (!categoria) {
        res.status(404).json({ message: "Categoría no encontrada" });
        return;
      }
      res.json(categoria);
    } catch (error) {
      next(error);
    }
  },

  /** Desactiva una categoría por ID (borrado lógico) */
  eliminar: async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const eliminada = await servicio.eliminar(req.params.id);
      if (!eliminada) {
        res.status(404).json({ message: "Categoría no encontrada" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
});
