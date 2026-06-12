/**
 * Cliente server-side del endpoint de productos del backend.
 * Pensado para Server Components — no usar en client components.
 */

export interface CategoriaProducto {
  id: string;
  nombre: string;
  cantidadItems?: number;
}

export interface Producto {
  id: string;
  nombre: string;
  precioUnitario: number;
  descripcion?: string;
  imageSrc?: string;
  cucarda?: string;
  category: CategoriaProducto[];
}

interface RespuestaPaginadaProductos {
  datos?: Producto[];
}

/** URL base del backend. Se puede sobrescribir con la env BACKEND_URL. */
const URL_BACKEND = process.env.BACKEND_URL ?? "http://localhost:4000";

interface OpcionesObtenerProductos {
  /** Cantidad máxima de productos a traer (mapea al `limite` del backend). */
  limite?: number;
  /** Filtro de texto opcional. */
  busqueda?: string;
}

/**
 * Obtiene productos del backend en SSR.
 * Ante cualquier falla (red caída, backend caído, JSON inválido) devuelve `[]`
 * para que la página renderice sin romper.
 */
export const obtenerProductos = async (
  opciones: OpcionesObtenerProductos = {},
): Promise<Producto[]> => {
  try {
    const url = new URL(`${URL_BACKEND}/api/products`);
    if (opciones.limite) {
      url.searchParams.set("limite", opciones.limite.toString());
    }
    if (opciones.busqueda) {
      url.searchParams.set("q", opciones.busqueda);
    }

    const respuesta = await fetch(url.toString(), {
      headers: { "Content-Type": "application/json" },
    });

    if (!respuesta.ok) return [];

    const datos: RespuestaPaginadaProductos = await respuesta.json();
    return datos?.datos ?? [];
  } catch {
    return [];
  }
};
