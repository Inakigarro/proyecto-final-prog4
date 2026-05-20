import { ProductService } from "../services/rbac/product.service";
import { Request, Response, NextFunction } from "express";
import { CrearItemDto, FiltrosProducto } from "../types/item.dtos";

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

/** Lista los items activos con paginación y filtro de texto opcional */
export const listar = async (
  req: Request<{}, {}, {}, { pagina?: string; limite?: string; q?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filtros: FiltrosProducto = {
      pagina: req.query.pagina ? parseInt(req.query.pagina, 10) : 1,
      limite: req.query.limite ? parseInt(req.query.limite, 10) : 20,
      q: req.query.q?.trim() || undefined,
    };
    const resultado = await servicio.listarProductos(filtros);
    res.json(resultado);
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
