import Item, { IItem } from "../../models/Item";
import { CrearProductoDto, ProductoResponse } from "../../types/product.dtos";
import { IProductService } from "../../types/rbac/product.service.interface";
import { ICategory } from "../../models/Category";

const POPULATE_CATEGORIES = {
  path : 'category', 
}

function mapearAResponseDto(product: IItem): ProductoResponse {
  const cat = product.category as unknown as ICategory;

  return {
    id: product._id.toString(),
    nombre: product.nombre,
    precioUnitario: product.precioUnitario,
    category: cat
      ? {
          id: cat._id,
          nombre: cat.nombre,
          items: cat.items,
        }
      : null,
  };
}


export class ProductService implements IProductService {

  constructor() {}

  async createProduct(product:CrearProductoDto): Promise<ProductoResponse> {
        const item = await Item.create(product);
        await item.populate(POPULATE_CATEGORIES);
        return mapearAResponseDto(item)
   }


 async updateProduct(id: string, product: Partial<IItem>): Promise<ProductoResponse | null> {

  if (product.precioUnitario !== undefined && product.precioUnitario <= 0) {
    throw new Error("El precio debe ser mayor a 0");
  }

  const updated = await Item.findByIdAndUpdate(id, product, { new: true })
    .populate(POPULATE_CATEGORIES);

  return updated ? mapearAResponseDto(updated) : null;
}
  async deleteProduct(id: string): Promise<IItem | null> {
  return await Item.findByIdAndDelete(id);
}

 async getAllProducts(): Promise<ProductoResponse[]> {
  const productos = await Item.find().populate(POPULATE_CATEGORIES);
  return productos.map(mapearAResponseDto);
}
  async getProductById(id: string): Promise<ProductoResponse | null> {
  const product = await Item.findById(id).populate(POPULATE_CATEGORIES);
  return product ? mapearAResponseDto(product) : null;
}}