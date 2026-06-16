import { FilterQuery, Types } from "mongoose";
import Item, { IItem } from "../../models/Item";
import Category, { ICategory } from "../../models/Category";
import Promotion from "../../models/Promotion";
import { CrearItemDto, FiltrosProducto, ItemResponse, ProductosPageResponse } from "../../types/item.dtos";
import { IProductService } from "../../types/rbac/product.service.interface";

/**
 * Populate de categorías: solo trae nombre e items (para el count).
 * No se populan los items dentro de la categoría para evitar profundidad innecesaria.
 */
const POPULATE_CATEGORIES = { path: 'category', select: 'nombre items' };

type ItemPopulado = Omit<IItem, 'category'> & { category: ICategory[] };

/**
 * Convierte un documento Mongoose (con categorías populadas) al DTO de respuesta.
 * Las categorías se devuelven en formato resumido: id, nombre y cantidad de items.
 */
function mapearAResponseDto(product: ItemPopulado): ItemResponse {
  return {
    id: product._id.toString(),
    nombre: product.nombre,
    descripcion: product.descripcion,
    imagen: product.imagen,
    precioUnitario: product.precioUnitario,
    stock: product.stock,
    category: product.category.map((cat) => ({
      id: cat._id.toString(),
      nombre: cat.nombre,
      cantidadItems: cat.items.length,
    })),
  };
}

export class ProductService implements IProductService {

  /**
   * Crea un nuevo item en la base de datos.
   * @param product - Datos del item a crear.
   * @returns El item creado como DTO de respuesta.
   */
  async createProduct(product: CrearItemDto): Promise<ItemResponse> {
    const item = await Item.create(product);
    await item.populate(POPULATE_CATEGORIES);
    return mapearAResponseDto(item as unknown as ItemPopulado);
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

    const updated = await Item.findOneAndUpdate(
      { _id: id, activo: { $ne: false } },
      product,
      { new: true }
    ).lean().populate(POPULATE_CATEGORIES);

    return updated ? mapearAResponseDto(updated as unknown as ItemPopulado) : null;
  }

  /**
   * Desactiva un item por su ID (borrado lógico) y lo desvincula de categorías y promociones.
   * @param id - ID del item a desactivar.
   * @returns true si fue desactivado, false si no se encontró o ya estaba inactivo.
   */
  async deleteProduct(id: string): Promise<boolean> {
    const resultado = await Item.findOneAndUpdate(
      { _id: id, activo: { $ne: false } },
      { activo: false }
    );
    if (!resultado) return false;

    const objectId = new Types.ObjectId(id);
    await Promise.all([
      Category.updateMany({ items: objectId }, { $pull: { items: objectId } }),
      Promotion.updateMany({ productos: objectId }, { $pull: { productos: objectId } }),
    ]);
    return true;
  }

  /**
   * Lista los items activos con paginación y filtro de texto opcional.
   * El texto busca por nombre, descripción o nombre de categoría.
   */
  async listarProductos(filtros: FiltrosProducto): Promise<ProductosPageResponse> {
    const pagina = Math.max(1, filtros.pagina ?? 1);
    const limite = Math.min(100, Math.max(1, filtros.limite ?? 20));
    const skip = (pagina - 1) * limite;

    const query: FilterQuery<IItem> = { activo: { $ne: false } };

    if (filtros.q) {
      const regex = new RegExp(filtros.q, 'i');

      // Resolver IDs de categorías que coincidan con el texto antes de filtrar items
      const categoriasCoincidentes = await Category.find({ nombre: regex }).select('_id').lean();
      const categoryIds = categoriasCoincidentes.map((c) => c._id);

      query.$or = [
        { nombre: regex },
        { descripcion: regex },
        { category: { $in: categoryIds } },
      ];
    }

    // Ejecutar count y find en paralelo para evitar dos round-trips secuenciales
    const [total, productos] = await Promise.all([
      Item.countDocuments(query),
      Item.find(query).skip(skip).limit(limite).lean().populate(POPULATE_CATEGORIES),
    ]);

    return {
      datos: (productos as unknown as ItemPopulado[]).map(mapearAResponseDto),
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  /**
   * Obtiene un item activo por su ID con la categoría populada.
   * @param id - ID del item a buscar.
   * @returns El item encontrado o null si no existe o está inactivo.
   */
  async getProductById(id: string): Promise<ItemResponse | null> {
    const product = await Item.findOne({ _id: id, activo: { $ne: false } }).lean().populate(POPULATE_CATEGORIES);
    return product ? mapearAResponseDto(product as unknown as ItemPopulado) : null;
  }
}
