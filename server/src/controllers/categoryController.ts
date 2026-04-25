import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/rbac/category.service";
import { CrearCategoryDto, ActualizarCategoryDto } from "../types/categories.dto";

const servicio = new CategoryService();

/** Devuelve todas las categorías con sus items populados */
export const listar = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categorias = await servicio.buscarTodasConItems();
    res.json(categorias);
  } catch (error) {
    next(error);
  }
};

/** Devuelve una categoría por ID con sus items populados */
export const obtenerPorId = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categoria = await servicio.buscarPorIdConItems(req.params.id);

    if (!categoria) {
      res.status(404).json({ message: "Categoría no encontrada" });
      return;
    }

    res.json(categoria);
  } catch (error) {
    next(error);
  }
};

/** Crea una nueva categoría */
export const crear = async (
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
};

/** Actualiza parcialmente una categoría por ID */
export const actualizar = async (
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
};

/** Elimina una categoría por ID */
export const eliminar = async (
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
};
