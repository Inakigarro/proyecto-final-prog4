import { ProductService } from "../services/rbac/product.service";
import { Request, Response, NextFunction } from "express";
import { CrearProductoDto } from "../types/product.dtos";

const servicio = new ProductService();

// ✅ Crear producto
export const crear = async (
  req: Request<{}, {}, CrearProductoDto>,
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

// ✅ Listar productos
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

// ✅ Obtener por ID
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

// ✅ Actualizar
export const actualizar = async (
  req: Request<{ id: string }, {}, CrearProductoDto>,
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

// ✅ Eliminar
export const eliminar = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await servicio.deleteProduct(req.params.id);

    if (!product) {
      res.status(404).json({ message: "Producto no encontrado" });
      return;
    }

    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};