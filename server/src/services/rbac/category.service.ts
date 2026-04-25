import { Types } from "mongoose";
import Category, { ICategory } from "../../models/Category";
import { IItem } from "../../models/Item";
import { CrearCategoryDto, ActualizarCategoryDto, CategoryResponseDto } from "../../types/categories.dto";

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
export class CategoryService {
  /**
   * Crea una nueva categoría.
   */
  async crear(categoryData: CrearCategoryDto): Promise<CategoryResponseDto> {
    const nuevaCategory = new Category(categoryData);
    const categoryGuardada = await nuevaCategory.save();
    return mapearACategoryResponseDto(categoryGuardada);
  }

  /**
   * Actualiza una categoría existente.
   */
  async actualizar(id: string, categoryData: ActualizarCategoryDto): Promise<CategoryResponseDto | null> {
    const categoryActualizada = await Category.findByIdAndUpdate(id, categoryData, { new: true });
    if (!categoryActualizada) return null;
    return mapearACategoryResponseDto(categoryActualizada);
  }

  /**
   * Elimina una categoría por su ID.
   * @returns true si se eliminó, false si no se encontró.
   */
  async eliminar(id: string): Promise<boolean> {
    const resultado = await Category.findByIdAndDelete(id);
    return !!resultado;
  }

  /**
   * Busca todas las categorías sin popular los items.
   */
  async buscarTodas(): Promise<CategoryResponseDto[]> {
    const categorias = await Category.find();
    return categorias.map(mapearACategoryResponseDto);
  }

  /**
   * Busca todas las categorías con los items populados.
   */
  async buscarTodasConItems(): Promise<CategoryResponseDto[]> {
    const categorias = await Category.find().populate("items");
    return categorias.map(mapearACategoryResponseDto);
  }

  /**
   * Busca una categoría por su ID sin popular los items.
   */
  async buscarPorId(id: string): Promise<CategoryResponseDto | null> {
    const category = await Category.findById(id);
    if (!category) return null;
    return mapearACategoryResponseDto(category);
  }

  /**
   * Busca una categoría por su ID con los items populados.
   */
  async buscarPorIdConItems(id: string): Promise<CategoryResponseDto | null> {
    const category = await Category.findById(id).populate("items");
    if (!category) return null;
    return mapearACategoryResponseDto(category);
  }
}