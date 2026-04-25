import Item, { IItem } from "../../models/Item";
import { CrearItemDto, ItemResponse } from "../../types/item.dtos";
import { IProductService } from "../../types/rbac/product.service.interface";
import { ICategory } from "../../models/Category";

const POPULATE_CATEGORIES = {
  path: 'category',
}

/**
 * Convierte un documento Mongoose al DTO de respuesta.
 * @param product - Documento del item desde MongoDB con categorías populadas.
 * @returns DTO con los datos públicos del item.
 */
function mapearAResponseDto(product: IItem): ItemResponse {
  const categorias = product.category as unknown as ICategory[];

  return {
    id: product._id.toString(),
    nombre: product.nombre,
    precioUnitario: product.precioUnitario,
    category: categorias.map((cat) => ({
      id: cat._id.toString(),
      nombre: cat.nombre,
      items: cat.items.map((i) => i.toString()),
    })),
  };
}


export class ProductService implements IProductService {

  constructor() {}

  /**
   * Crea un nuevo item en la base de datos.
   * @param product - Datos del item a crear.
   * @returns El item creado como DTO de respuesta.
   */
  async createProduct(product: CrearItemDto): Promise<ItemResponse> {
        const item = await Item.create(product);
        await item.populate(POPULATE_CATEGORIES);
        return mapearAResponseDto(item)
   }


  /**
   * Actualiza parcialmente un item existente por su ID.
   * @param id - ID del item a actualizar.
   * @param product - Campos a actualizar.
   * @returns El item actualizado o null si no existe.
   */
  async updateProduct(id: string, product: Partial<CrearItemDto>): Promise<ItemResponse | null> {

  if (product.precioUnitario !== undefined && product.precioUnitario <= 0) {
    throw new Error("El precio debe ser mayor a 0");
  }

  const updated = await Item.findByIdAndUpdate(id, product, { new: true })
    .populate(POPULATE_CATEGORIES);

  return updated ? mapearAResponseDto(updated) : null;
}
  /**
   * Elimina un item por su ID.
   * @param id - ID del item a eliminar.
   * @returns El documento eliminado o null si no existe.
   */
  async deleteProduct(id: string): Promise<IItem | null> {
  return await Item.findByIdAndDelete(id);
}

  /**
   * Obtiene todos los items con su categoría populada.
   * @returns Lista de items como DTOs de respuesta.
   */
  async getAllProducts(): Promise<ItemResponse[]> {
  const productos = await Item.find().populate(POPULATE_CATEGORIES);
  return productos.map(mapearAResponseDto);
}
  /**
   * Obtiene un item por su ID con la categoría populada.
   * @param id - ID del item a buscar.
   * @returns El item encontrado o null si no existe.
   */
  async getProductById(id: string): Promise<ItemResponse | null> {
  const product = await Item.findById(id).populate(POPULATE_CATEGORIES);
  return product ? mapearAResponseDto(product) : null;
}}