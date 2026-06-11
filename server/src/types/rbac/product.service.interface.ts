import { CrearItemDto, FiltrosProducto, ItemResponse, ProductosPageResponse } from "../item.dtos";

export interface IProductService {
  createProduct(product: CrearItemDto): Promise<ItemResponse>;

  updateProduct(id: string, product: Partial<CrearItemDto>): Promise<ItemResponse | null>;

  /** Borrado lógico: devuelve true si el item existía y fue desactivado. */
  deleteProduct(id: string): Promise<boolean>;

  listarProductos(filtros: FiltrosProducto): Promise<ProductosPageResponse>;

  getProductById(id: string): Promise<ItemResponse | null>;
}
