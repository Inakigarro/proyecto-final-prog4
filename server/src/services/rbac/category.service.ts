import Category, { ICategory } from "../../models/Category";
import Item, { IItem } from "../../models/Item";
import { CrearCategoryDto, ActualizarCategoryDto, CategoryResumenDto, CategoryDetalleDto } from "../../types/categories.dto";
import { ICategoryService } from "../../types/rbac/category.service.interface";
import { Types } from "mongoose";

/**
 * Convierte un documento de categoría al DTO de resumen.
 * No requiere populate: usa items.length directamente sobre el array de ObjectIds.
 */
const mapearAResumenDto = (category: ICategory): CategoryResumenDto => ({
  id: category._id.toString(),
  nombre: category.nombre,
  cantidadItems: category.items.length,
});

/**
 * Convierte un documento de categoría con items populados al DTO de detalle.
 * Incluye un resumen de cada item (id, nombre, precioUnitario) sin sus categorías.
 */
const mapearADetalleDto = (category: ICategory): CategoryDetalleDto => {
  const items = category.items as unknown as (IItem | Types.ObjectId)[];
  return {
    id: category._id.toString(),
    nombre: category.nombre,
    cantidadItems: items.length,
    items: items.map((item) => {
      if (typeof item === "object" && "nombre" in item) {
        const i = item as IItem;
        return { id: i._id.toString(), nombre: i.nombre, precioUnitario: i.precioUnitario };
      }
      // Fallback: no debería ocurrir si el populate funcionó correctamente
      return { id: item.toString(), nombre: "", precioUnitario: 0 };
    }),
  };
};

/**
 * Implementación del servicio de categorías.
 */
export class CategoryService implements ICategoryService {
  /**
   * Crea una nueva categoría.
   */
  async crear(categoryData: CrearCategoryDto): Promise<CategoryResumenDto> {
    const nuevaCategory = new Category(categoryData);
    const categoryGuardada = await nuevaCategory.save();
    return mapearAResumenDto(categoryGuardada);
  }

  /**
   * Actualiza una categoría activa existente.
   */
  async actualizar(id: string, categoryData: ActualizarCategoryDto): Promise<CategoryResumenDto | null> {
    const categoryActualizada = await Category.findOneAndUpdate(
      { _id: id, activo: { $ne: false } },
      categoryData,
      { new: true }
    ).lean();
    if (!categoryActualizada) return null;
    return mapearAResumenDto(categoryActualizada as unknown as ICategory);
  }

  /**
   * Desactiva una categoría por su ID (borrado lógico) y la desvincula de todos los items.
   * @returns true si fue desactivada, false si no se encontró o ya estaba inactiva.
   */
  async eliminar(id: string): Promise<boolean> {
    const resultado = await Category.findOneAndUpdate(
      { _id: id, activo: { $ne: false } },
      { activo: false }
    );
    if (!resultado) return false;

    const objectId = new Types.ObjectId(id);
    await Item.updateMany({ category: objectId }, { $pull: { category: objectId } });
    return true;
  }

  /**
   * Lista todas las categorías activas con su cantidad de items.
   * No popula los items para mantener respuestas livianas.
   */
  async buscarTodas(): Promise<CategoryResumenDto[]> {
    const categorias = await Category.find({ activo: { $ne: false } }).lean();
    return (categorias as unknown as ICategory[]).map(mapearAResumenDto);
  }

  /**
   * Obtiene una categoría activa por ID con sus items resumidos (id, nombre, precioUnitario).
   * Solo trae los campos necesarios de cada item para evitar profundidad innecesaria.
   */
  async buscarPorId(id: string): Promise<CategoryDetalleDto | null> {
    const category = await Category.findOne({ _id: id, activo: { $ne: false } })
      .populate({ path: "items", select: "nombre precioUnitario" })
      .lean();
    if (!category) return null;
    return mapearADetalleDto(category as unknown as ICategory);
  }
}
