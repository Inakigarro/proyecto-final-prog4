import { CrearItemDto, ItemResponse } from "../item.dtos";
import { IItem } from "../../models/Item";

export interface IProductService {
  createProduct(product: CrearItemDto): Promise<ItemResponse>;

  updateProduct(id: string, product: Partial<CrearItemDto>): Promise<ItemResponse | null>;

  deleteProduct(id: string): Promise<IItem | null>;

  getAllProducts(): Promise<ItemResponse[]>;

  getProductById(id: string): Promise<ItemResponse | null>;
}