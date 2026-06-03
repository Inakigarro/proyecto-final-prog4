/**
 * Cliente server-side del endpoint de promociones del backend.
 * Pensado para Server Components — no usar en client components.
 */

import type { Producto } from "./productos";

export type TipoPromocion = "DESCUENTO_PORCENTUAL" | "NXM" | "SEGUNDA_UNIDAD";

export interface ParametrosPromocion {
  porcentaje?: number;
  cantidadLleva?: number;
  cantidadPaga?: number;
  descuentoSegundaUnidad?: number;
}

export interface Promocion {
  idPromocion: string;
  nombrePromocion: string;
  tipoPromocion: TipoPromocion;
  parametros: ParametrosPromocion;
  idsProductos: string[];
}

const URL_BACKEND = process.env.BACKEND_URL ?? "http://localhost:4001";

/** Trae todas las promociones activas. Devuelve `[]` ante cualquier falla. */
export const obtenerPromociones = async (): Promise<Promocion[]> => {
  try {
    const respuesta = await fetch(`${URL_BACKEND}/api/promotions`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!respuesta.ok) return [];
    return (await respuesta.json()) as Promocion[];
  } catch {
    return [];
  }
};

/** Trae una promoción por id. Devuelve `null` ante 404 o cualquier falla. */
export const obtenerPromocionPorId = async (
  id: string,
): Promise<Promocion | null> => {
  try {
    const respuesta = await fetch(`${URL_BACKEND}/api/promotions/${id}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!respuesta.ok) return null;
    return (await respuesta.json()) as Promocion;
  } catch {
    return null;
  }
};

/** Trae los productos asociados a una promoción, ya populados. */
export const obtenerProductosDePromocion = async (
  idPromocion: string,
): Promise<Producto[]> => {
  try {
    const respuesta = await fetch(
      `${URL_BACKEND}/api/promotions/${idPromocion}/productos`,
      { headers: { "Content-Type": "application/json" } },
    );
    if (!respuesta.ok) return [];
    return (await respuesta.json()) as Producto[];
  } catch {
    return [];
  }
};

/**
 * Devuelve la etiqueta corta para mostrar el tipo de promoción.
 * Ej: "15% OFF", "3x2", "2da unidad 50% OFF".
 */
export const describirPromocion = (promocion: Promocion): string => {
  const { tipoPromocion, parametros } = promocion;
  switch (tipoPromocion) {
    case "DESCUENTO_PORCENTUAL":
      return `${parametros.porcentaje ?? 0}% OFF`;
    case "NXM":
      return `${parametros.cantidadLleva ?? 0}x${parametros.cantidadPaga ?? 0}`;
    case "SEGUNDA_UNIDAD":
      return `2da unidad ${parametros.descuentoSegundaUnidad ?? 0}% OFF`;
  }
};

/**
 * Aproxima el descuento porcentual efectivo de una promoción para poder comparar
 * entre distintos tipos. No es el descuento exacto del carrito, es solo una métrica
 * de orden para elegir cuál mostrar como cucarda.
 *
 * - PORCENTUAL: el porcentaje declarado.
 * - NXM: `(lleva - paga) / lleva * 100`. Ej: 3x2 = 33%.
 * - SEGUNDA_UNIDAD: `descuentoSegunda / 2`. Ej: 50% off 2da = 25% promedio.
 */
const descuentoEfectivo = (promocion: Promocion): number => {
  const { tipoPromocion, parametros } = promocion;
  switch (tipoPromocion) {
    case "DESCUENTO_PORCENTUAL":
      return parametros.porcentaje ?? 0;
    case "NXM": {
      const lleva = parametros.cantidadLleva ?? 0;
      const paga = parametros.cantidadPaga ?? 0;
      if (lleva <= 0) return 0;
      return ((lleva - paga) / lleva) * 100;
    }
    case "SEGUNDA_UNIDAD":
      return (parametros.descuentoSegundaUnidad ?? 0) / 2;
  }
};

/**
 * Dado un producto y un conjunto de promociones, devuelve la promo con mayor
 * descuento aparente que lo incluya. Empate → primera en orden.
 * Devuelve `undefined` si ninguna aplica.
 */
export const buscarPromocionAplicable = (
  idProducto: string,
  promociones: Promocion[],
): Promocion | undefined => {
  const aplicables = promociones.filter((promocion) =>
    promocion.idsProductos.includes(idProducto),
  );
  if (aplicables.length === 0) return undefined;
  return aplicables.reduce((mejor, actual) =>
    descuentoEfectivo(actual) > descuentoEfectivo(mejor) ? actual : mejor,
  );
};

/**
 * Versión "texto" de `buscarPromocionAplicable`: devuelve directamente la
 * etiqueta de cucarda. Útil cuando solo se necesita display.
 */
export const derivarCucarda = (
  idProducto: string,
  promociones: Promocion[],
): string | undefined => {
  const promocion = buscarPromocionAplicable(idProducto, promociones);
  return promocion ? describirPromocion(promocion) : undefined;
};

export interface ResultadoDescuento {
  /** precioUnitario * cantidad, sin promoción. */
  subtotalSinDescuento: number;
  /** Monto final a pagar por este item con la promo aplicada. */
  subtotalConDescuento: number;
  /**
   * Precio unitario con descuento. Solo se llena para DESCUENTO_PORCENTUAL.
   * En NXM y SEGUNDA_UNIDAD el precio unitario individual no cambia.
   */
  precioUnitarioConDescuento?: number;
  /** subtotalSinDescuento - subtotalConDescuento. */
  ahorroTotal: number;
}

const redondear = (valor: number): number => parseFloat(valor.toFixed(2));

/**
 * Calcula el descuento de un item según la promoción aplicada.
 * Misma lógica que el helper del backend — espejada en cliente para que
 * las cards puedan pintar precio tachado sin esperar al validate.
 */
export const calcularDescuentoItem = (
  precioUnitario: number,
  cantidad: number,
  promocion?: Promocion,
): ResultadoDescuento => {
  const subtotalSinDescuento = redondear(precioUnitario * cantidad);
  if (!promocion || cantidad <= 0) {
    return {
      subtotalSinDescuento,
      subtotalConDescuento: subtotalSinDescuento,
      ahorroTotal: 0,
    };
  }

  const { tipoPromocion, parametros } = promocion;
  switch (tipoPromocion) {
    case "DESCUENTO_PORCENTUAL": {
      const porcentaje = parametros.porcentaje ?? 0;
      const precioConDescuento = redondear(precioUnitario * (1 - porcentaje / 100));
      const subtotalConDescuento = redondear(precioConDescuento * cantidad);
      return {
        subtotalSinDescuento,
        subtotalConDescuento,
        precioUnitarioConDescuento: precioConDescuento,
        ahorroTotal: redondear(subtotalSinDescuento - subtotalConDescuento),
      };
    }
    case "NXM": {
      const lleva = parametros.cantidadLleva ?? 0;
      const paga = parametros.cantidadPaga ?? 0;
      if (lleva <= 0 || paga <= 0 || lleva <= paga) {
        return {
          subtotalSinDescuento,
          subtotalConDescuento: subtotalSinDescuento,
          ahorroTotal: 0,
        };
      }
      const grupos = Math.floor(cantidad / lleva);
      const unidadesGratis = grupos * (lleva - paga);
      const unidadesAPagar = cantidad - unidadesGratis;
      const subtotalConDescuento = redondear(unidadesAPagar * precioUnitario);
      return {
        subtotalSinDescuento,
        subtotalConDescuento,
        ahorroTotal: redondear(subtotalSinDescuento - subtotalConDescuento),
      };
    }
    case "SEGUNDA_UNIDAD": {
      const descuento = parametros.descuentoSegundaUnidad ?? 0;
      const factor = 1 - descuento / 100;
      const pares = Math.floor(cantidad / 2);
      const impares = cantidad % 2;
      const subtotalConDescuento = redondear(
        pares * precioUnitario * (1 + factor) + impares * precioUnitario,
      );
      return {
        subtotalSinDescuento,
        subtotalConDescuento,
        ahorroTotal: redondear(subtotalSinDescuento - subtotalConDescuento),
      };
    }
  }
};
