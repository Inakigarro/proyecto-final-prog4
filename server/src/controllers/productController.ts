import { ProductService } from "../services/rbac/product.service";
import { Request, Response, NextFunction } from "express";
import { CrearItemDto } from "../types/item.dtos";

const servicio = new ProductService();

/** Crea un nuevo item y lo devuelve con su categoría populada */
export const crear = async (
  req: Request<{}, {}, CrearItemDto>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await servicio.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

/** Devuelve todos los items activos con su categoría populada */
export const listar = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productos = await servicio.getAllProducts();
    res.json(productos);
  } catch (error) {
    next(error);
  }
};

/** Devuelve un item activo por ID con su categoría populada */
export const obtenerPorId = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await servicio.getProductById(req.params.id);

    if (!product) {
      res.status(404).json({ message: "Producto no encontrado" });
      return;
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

/** Actualiza parcialmente un item por ID */
export const actualizar = async (
  req: Request<{ id: string }, {}, Partial<CrearItemDto>>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await servicio.updateProduct(req.params.id, req.body);

    if (!product) {
      res.status(404).json({ message: "Producto no encontrado" });
      return;
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

/** Desactiva un item por ID (borrado lógico) */
export const eliminar = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eliminado = await servicio.deleteProduct(req.params.id);

    if (!eliminado) {
      res.status(404).json({ message: "Producto no encontrado" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
