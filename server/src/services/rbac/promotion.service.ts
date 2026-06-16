import Promotion, { IPromotion } from '../../models/Promotion';
import Item, { IItem } from '../../models/Item';
import { ICategory } from '../../models/Category';
import {
  CrearPromotionDto,
  ActualizarPromotionDto,
  PromotionResponse,
} from '../../types/promotion.dtos';
import { ItemResponse } from '../../types/item.dtos';
import { IPromotionService } from '../../types/rbac/promotion.service.interface';

/**
 * Populate de categorías al consultar items: solo nombre e items (para el count).
 * Replicado de product.service para no acoplar ambos archivos por ahora;
 * pendiente: mover a un mapper compartido cuando se refactorice product.service.
 */
const POPULATE_CATEGORIES = { path: 'category', select: 'nombre items' };

type ItemPopulado = Omit<IItem, 'category'> & { category: ICategory[] };

/** Convierte un documento Mongoose de Promotion al shape de respuesta acordado. */
const mapearAPromotionResponse = (promotion: IPromotion): PromotionResponse => ({
  idPromocion: promotion._id.toString(),
  nombrePromocion: promotion.nombre,
  tipoPromocion: promotion.tipo,
  parametros: promotion.parametros ?? {},
  idsProductos: promotion.productos.map((id) => id.toString()),
});

/** Convierte un item populado al DTO de respuesta de producto. */
const mapearItemAResponse = (item: ItemPopulado): ItemResponse => ({
  id: item._id.toString(),
  nombre: item.nombre,
  descripcion: item.descripcion,
  imagen: item.imagen,
  precioUnitario: item.precioUnitario,
  stock: item.stock,
  category: item.category.map((cat) => ({
    id: cat._id.toString(),
    nombre: cat.nombre,
    cantidadItems: cat.items.length,
  })),
});

export class PromotionService implements IPromotionService {
  async buscarTodas(): Promise<PromotionResponse[]> {
    const promociones = await Promotion.find({ activo: { $ne: false } }).lean();
    return (promociones as unknown as IPromotion[]).map(mapearAPromotionResponse);
  }

  async buscarPorId(id: string): Promise<PromotionResponse | null> {
    const promocion = await Promotion.findOne({
      _id: id,
      activo: { $ne: false },
    }).lean();
    return promocion
      ? mapearAPromotionResponse(promocion as unknown as IPromotion)
      : null;
  }

  async crear(dto: CrearPromotionDto): Promise<PromotionResponse> {
    const nueva = new Promotion(dto);
    const guardada = await nueva.save();
    return mapearAPromotionResponse(guardada);
  }

  async actualizar(
    id: string,
    dto: ActualizarPromotionDto,
  ): Promise<PromotionResponse | null> {
    const actualizada = await Promotion.findOneAndUpdate(
      { _id: id, activo: { $ne: false } },
      dto,
      { new: true, runValidators: true },
    ).lean();
    return actualizada
      ? mapearAPromotionResponse(actualizada as unknown as IPromotion)
      : null;
  }

  async eliminar(id: string): Promise<boolean> {
    const resultado = await Promotion.findOneAndUpdate(
      { _id: id, activo: { $ne: false } },
      { activo: false },
    );
    return !!resultado;
  }

  async obtenerProductosDePromocion(id: string): Promise<ItemResponse[] | null> {
    const promocion = await Promotion.findOne({
      _id: id,
      activo: { $ne: false },
    }).lean();
    if (!promocion) return null;

    const idsProductos = (promocion as unknown as IPromotion).productos;
    if (idsProductos.length === 0) return [];

    const items = await Item.find({
      _id: { $in: idsProductos },
      activo: { $ne: false },
    })
      .lean()
      .populate(POPULATE_CATEGORIES);

    return (items as unknown as ItemPopulado[]).map(mapearItemAResponse);
  }
}
