import { IProduct } from "../../models/Product";

export interface ProductService {
  createProduct(product: IProduct): Promise<IProduct>;

  updateProduct(id: string, product: Partial<IProduct>): Promise<IProduct>;

  deleteProduct(id: string): Promise<void>;

  getAllProducts(): Promise<IProduct[]>;

  getProductById(id: string): Promise<IProduct | null>;
}