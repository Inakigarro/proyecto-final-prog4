import { Types } from "mongoose";
import Item, { IItem } from "../../models/Item";

/**
 * DTO de respuesta para un item.
 */
interface ItemResponseDto {
  id: string;
  nombre: string;
  precioUnitario: number;
  category: string[];
  
}

/**
 * Convierte un documento Mongoose al DTO de respuesta.
 * @param item - Documento del item desde MongoDB.
 * @returns DTO con los datos públicos del item.
 */
   const mapearAItemResponseDto = (item: IItem): ItemResponseDto => ({
  id: item._id.toString(),
  nombre: item.nombre,
  precioUnitario: item.precioUnitario,
  category: item.category.map(cat => cat.toString()),
  
});

/**
 * Implementación del servicio de items.
 */
export class ItemService {
  /**
   * Crea un nuevo item.
   * @param itemData - Datos del item a crear.
   * @returns El item creado como DTO de respuesta.
   */
  async crear(itemData: Partial<IItem>): Promise<ItemResponseDto> {
    const nuevoItem = new Item(itemData);
    const itemGuardado = await nuevoItem.save();
    return mapearAItemResponseDto(itemGuardado);
  }
   /**
   * Actualiza un item existente.
   * @param id - ID del item a actualizar.
   * @param itemData - Datos a actualizar.
   * @returns El item actualizado como DTO de respuesta o null si no existe.
   */
  async actualizar(id: string, itemData: Partial<IItem>): Promise<ItemResponseDto | null> {
    const itemActualizado = await Item.findByIdAndUpdate(id, itemData, { new: true });
    if (!itemActualizado) return null;
    return mapearAItemResponseDto(itemActualizado);
  }

  /**
   * Deshabilita un item (establece habilitado a false).
   * @param id - ID del item a deshabilitar.
   * @returns true si se deshabilitó, false si no se encontró.
   */
  async deshabilitar(id: string): Promise<boolean> {
    const resultado = await Item.findByIdAndUpdate(id, { habilitado: false });
    return !!resultado;
  }
 /**
   * Busca todos los items.
   * @returns Lista de items como DTOs de respuesta.
   */
  async buscarTodos(): Promise<ItemResponseDto[]> {
    const items = await Item.find();
    return items.map(mapearAItemResponseDto);
  }

  /**
   * Busca un item por su ID.
   * @param id - ID del item a buscar.
   * @returns El item encontrado como DTO de respuesta o null si no existe.
   */
  async buscarPorId(id: string): Promise<ItemResponseDto | null> {
    const item = await Item.findById(id);
    if (!item) return null;
    return mapearAItemResponseDto(item);
  }
}