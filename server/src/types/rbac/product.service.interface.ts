import { CrearProductoDto, ProductoResponse } from "../product.dtos";
import { IItem } from "../../models/Item";

export interface IProductService {
  createProduct(product: CrearProductoDto): Promise<ProductoResponse>;

  updateProduct(id: string, product: Partial<IItem>): Promise<ProductoResponse | null>;

  deleteProduct(id: string): Promise<IItem | null>;

  getAllProducts(): Promise<ProductoResponse[]>;

  getProductById(id: string): Promise<ProductoResponse | null>;
}