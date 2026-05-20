import { Types } from "mongoose";
import Category, { ICategory } from "../../models/Category";
import { IItem } from "../../models/Item";
import { CrearCategoryDto, ActualizarCategoryDto, CategoryResponseDto } from "../../types/categories.dto";
import { ICategoryService } from "../../types/rbac/category.service.interface";

/**
 * Convierte un documento Mongoose al DTO de respuesta.
 * Si items está populado, devuelve los nombres; si no, devuelve los IDs como strings.
 */
const mapearACategoryResponseDto = (category: ICategory): CategoryResponseDto => ({
  id: category._id.toString(),
  nombre: category.nombre,
  items: (category.items as unknown as (IItem | Types.ObjectId)[]).map((item) =>
    typeof item === "object" && "nombre" in item
      ? (item as IItem).nombre
      : item.toString()
  ),
});

/**
 * Implementación del servicio de categorías.
 */
export class CategoryService implements ICategoryService {
  /**
   * Crea una nueva categoría.
   */
  async crear(categoryData: CrearCategoryDto): Promise<CategoryResponseDto> {
    const nuevaCategory = new Category(categoryData);
    const categoryGuardada = await nuevaCategory.save();
    return mapearACategoryResponseDto(categoryGuardada);
  }

  /**
   * Actualiza una categoría activa existente.
   */
  async actualizar(id: string, categoryData: ActualizarCategoryDto): Promise<CategoryResponseDto | null> {
    const categoryActualizada = await Category.findOneAndUpdate(
      { _id: id, activo: { $ne: false } },
      categoryData,
      { new: true }
    ).lean();
    if (!categoryActualizada) return null;
    return mapearACategoryResponseDto(categoryActualizada as unknown as ICategory);
  }

  /**
   * Desactiva una categoría por su ID (borrado lógico).
   * @returns true si fue desactivada, false si no se encontró o ya estaba inactiva.
   */
  async eliminar(id: string): Promise<boolean> {
    const resultado = await Category.findOneAndUpdate(
      { _id: id, activo: { $ne: false } },
      { activo: false }
    );
    return !!resultado;
  }

  /**
   * Busca todas las categorías activas sin popular los items.
   */
  async buscarTodas(): Promise<CategoryResponseDto[]> {
    const categorias = await Category.find({ activo: { $ne: false } }).lean();
    return (categorias as unknown as ICategory[]).map(mapearACategoryResponseDto);
  }

  /**
   * Busca todas las categorías activas con los items populados.
   */
  async buscarTodasConItems(): Promise<CategoryResponseDto[]> {
    const categorias = await Category.find({ activo: { $ne: false } }).lean().populate("items");
    return (categorias as unknown as ICategory[]).map(mapearACategoryResponseDto);
  }

  /**
   * Busca una categoría activa por su ID sin popular los items.
   */
  async buscarPorId(id: string): Promise<CategoryResponseDto | null> {
    const category = await Category.findOne({ _id: id, activo: { $ne: false } }).lean();
    if (!category) return null;
    return mapearACategoryResponseDto(category as unknown as ICategory);
  }

  /**
   * Busca una categoría activa por su ID con los items populados.
   */
  async buscarPorIdConItems(id: string): Promise<CategoryResponseDto | null> {
    const category = await Category.findOne({ _id: id, activo: { $ne: false } }).lean().populate("items");
    if (!category) return null;
    return mapearACategoryResponseDto(category as unknown as ICategory);
  }
}
