import {
  IParametrosPromocion,
  TipoPromocion,
} from '../models/Promotion';

/**
 * Datos mínimos de una promoción para alimentar la calculadora.
 * No depende del documento Mongoose para que el helper sea reutilizable.
 */
export interface PromocionAplicable {
  idPromocion: string;
  nombrePromocion: string;
  tipoPromocion: TipoPromocion;
  parametros: IParametrosPromocion;
}

export interface ResultadoDescuento {
  /** precioUnitario * cantidad, sin aplicar promoción. */
  subtotalSinDescuento: number;
  /** Monto final a pagar por este item, post-promoción. */
  subtotalConDescuento: number;
  /**
   * Precio unitario con descuento aplicado.
   * Solo se llena para DESCUENTO_PORCENTUAL — en NXM y SEGUNDA_UNIDAD
   * el precio unitario individual no cambia.
   */
  precioUnitarioConDescuento?: number;
  /** subtotalSinDescuento - subtotalConDescuento. */
  ahorroTotal: number;
}

const redondear = (valor: number): number => parseFloat(valor.toFixed(2));

/**
 * Aproxima el porcentaje de descuento efectivo de una promoción.
 * Sirve para comparar entre tipos y elegir la mejor cuando un mismo
 * producto matchea con varias.
 */
const descuentoEfectivo = (promocion: PromocionAplicable): number => {
  const { tipoPromocion, parametros } = promocion;
  switch (tipoPromocion) {
    case 'DESCUENTO_PORCENTUAL':
      return parametros.porcentaje ?? 0;
    case 'NXM': {
      const lleva = parametros.cantidadLleva ?? 0;
      const paga = parametros.cantidadPaga ?? 0;
      if (lleva <= 0) return 0;
      return ((lleva - paga) / lleva) * 100;
    }
    case 'SEGUNDA_UNIDAD':
      return (parametros.descuentoSegundaUnidad ?? 0) / 2;
  }
};

/**
 * De un conjunto de promociones aplicables a un mismo producto,
 * devuelve la de mayor descuento efectivo. Empate → primera.
 */
export const elegirMejorPromocion = (
  promociones: PromocionAplicable[],
): PromocionAplicable | undefined => {
  if (promociones.length === 0) return undefined;
  return promociones.reduce((mejor, actual) =>
    descuentoEfectivo(actual) > descuentoEfectivo(mejor) ? actual : mejor,
  );
};

/**
 * Calcula el descuento de un item según la promoción que tenga aplicada.
 * Función pura — sin acceso a BD. Misma lógica espejada en el frontend.
 */
export const calcularDescuentoItem = (
  precioUnitario: number,
  cantidad: number,
  promocion?: PromocionAplicable,
): ResultadoDescuento => {
  const subtotalSinDescuento = redondear(precioUnitario * cantidad);
  if (!promocion || cantidad <= 0) {
    return {
      subtotalSinDescuento,
      subtotalConDescuento: subtotalSinDescuento,
      ahorroTotal: 0,
    };
  }

  switch (promocion.tipoPromocion) {
    case 'DESCUENTO_PORCENTUAL': {
      const porcentaje = promocion.parametros.porcentaje ?? 0;
      const precioConDescuento = redondear(precioUnitario * (1 - porcentaje / 100));
      const subtotalConDescuento = redondear(precioConDescuento * cantidad);
      return {
        subtotalSinDescuento,
        subtotalConDescuento,
        precioUnitarioConDescuento: precioConDescuento,
        ahorroTotal: redondear(subtotalSinDescuento - subtotalConDescuento),
      };
    }
    case 'NXM': {
      const lleva = promocion.parametros.cantidadLleva ?? 0;
      const paga = promocion.parametros.cantidadPaga ?? 0;
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
    case 'SEGUNDA_UNIDAD': {
      const descuento = promocion.parametros.descuentoSegundaUnidad ?? 0;
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

/** Etiqueta corta para mostrar el tipo de promoción aplicada (ej. "15% OFF", "3x2"). */
export const describirPromocionAplicada = (promocion: PromocionAplicable): string => {
  const { tipoPromocion, parametros } = promocion;
  switch (tipoPromocion) {
    case 'DESCUENTO_PORCENTUAL':
      return `${parametros.porcentaje ?? 0}% OFF`;
    case 'NXM':
      return `${parametros.cantidadLleva ?? 0}x${parametros.cantidadPaga ?? 0}`;
    case 'SEGUNDA_UNIDAD':
      return `2da unidad ${parametros.descuentoSegundaUnidad ?? 0}% OFF`;
  }
};
