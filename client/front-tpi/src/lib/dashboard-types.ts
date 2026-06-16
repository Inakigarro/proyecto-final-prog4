// Tipos compartidos para el dashboard de gestión

export interface CategoriaResumen {
  id: string;
  nombre: string;
  cantidadItems: number;
}

export interface ProductoDashboard {
  id: string;
  nombre: string;
  descripcion?: string;
  /** URL pública de la imagen principal del producto. */
  imagen?: string;
  precioUnitario: number;
  stock: number;
  category: CategoriaResumen[];
}

/** Slide del slider del home tal como lo expone el backend. */
export interface SlideDashboard {
  id: string;
  imagen: string;
  alt: string;
  leyenda: string;
  orden: number;
}

/** Respuesta del endpoint que sube la imagen del slide. */
export interface SlideUploadResponse {
  url: string;
}

export interface ProductosPageResponse {
  datos: ProductoDashboard[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface CategoriaDashboard {
  id: string;
  nombre: string;
  cantidadItems: number;
}

export type TipoPromocion = 'DESCUENTO_PORCENTUAL' | 'NXM' | 'SEGUNDA_UNIDAD';

export interface ParametrosPromocion {
  porcentaje?: number;
  cantidadLleva?: number;
  cantidadPaga?: number;
  descuentoSegundaUnidad?: number;
}

export interface PromocionDashboard {
  idPromocion: string;
  nombrePromocion: string;
  tipoPromocion: TipoPromocion;
  parametros: ParametrosPromocion;
  idsProductos: string[];
}
