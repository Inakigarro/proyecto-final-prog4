/**
 * Aplica descuentos acumulativos sobre un monto base.
 * Cada descuento es un porcentaje (0-100) que se aplica sobre el resultado anterior.
 * Ej.: [50, 50] sobre 100 → 100 * 0.5 * 0.5 = 25 (no 0).
 */
export function aplicarDescuentos(montoBase: number, descuentos: number[]): number {
  const factor = descuentos.reduce((acc, d) => acc * (1 - d / 100), 1);
  return parseFloat((montoBase * factor).toFixed(2));
}
