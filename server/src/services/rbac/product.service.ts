import { IProduct } from "../../models/Product";
import { ProductService } from "../../types/rbac/product.service.interface";

export class ProductServiceImpl implements ProductService {

  constructor(private productRepository: any) {}

  async createProduct(product: IProduct): Promise<IProduct> {

    // 🔹 Validaciones simples
    if (!product.name || product.name.trim() === "") {
      throw new Error("El nombre es obligatorio");
    }

    if (product.price <= 0) {
      throw new Error("El precio debe ser mayor a 0");
    }

    if (product.stock < 0) {
      throw new Error("El stock no puede ser negativo");
    }

    if (!product.categoryId) {
      throw new Error("La categoría es obligatoria");
    }

    return this.productRepository.create(product);
  }

  async updateProduct(id: string, product: Partial<IProduct>): Promise<IProduct> {

    // 🔹 Validaciones en update
    if (product.price !== undefined && product.price <= 0) {
      throw new Error("El precio debe ser mayor a 0");
    }

    if (product.stock !== undefined && product.stock < 0) {
      throw new Error("El stock no puede ser negativo");
    }

    return this.productRepository.update(id, product);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.productRepository.delete(id);
  }

  async getAllProducts(): Promise<IProduct[]> {
    return this.productRepository.findAll();
  }

  async getProductById(id: string): Promise<IProduct | null> {
    return this.productRepository.findById(id);
  }
}
