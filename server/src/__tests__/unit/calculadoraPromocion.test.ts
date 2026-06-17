/**
 * Tests unitarios de la calculadora de promociones.
 * Son funciones puras: no requieren conexión a la base de datos.
 */
import {
  calcularDescuentoItem,
  elegirMejorPromocion,
  describirPromocionAplicada,
  type PromocionAplicable,
} from '../../utils/calculadoraPromocion';

const promoPorcentaje = (porcentaje: number): PromocionAplicable => ({
  idPromocion: 'p1',
  nombrePromocion: `${porcentaje}% OFF`,
  tipoPromocion: 'DESCUENTO_PORCENTUAL',
  parametros: { porcentaje },
});

const promoNxM = (lleva: number, paga: number): PromocionAplicable => ({
  idPromocion: 'p2',
  nombrePromocion: `${lleva}x${paga}`,
  tipoPromocion: 'NXM',
  parametros: { cantidadLleva: lleva, cantidadPaga: paga },
});

const promoSegundaUnidad = (descuento: number): PromocionAplicable => ({
  idPromocion: 'p3',
  nombrePromocion: `2da unidad ${descuento}%`,
  tipoPromocion: 'SEGUNDA_UNIDAD',
  parametros: { descuentoSegundaUnidad: descuento },
});

describe('calcularDescuentoItem', () => {
  // ──────────────────────────────────────────────
  // Sin promoción / casos borde
  // ──────────────────────────────────────────────
  test('sin promoción → devuelve subtotal sin descuento', () => {
    const r = calcularDescuentoItem(100, 3);
    expect(r.subtotalSinDescuento).toBe(300);
    expect(r.subtotalConDescuento).toBe(300);
    expect(r.ahorroTotal).toBe(0);
  });

  test('cantidad 0 → no aplica promoción aunque exista', () => {
    const r = calcularDescuentoItem(100, 0, promoPorcentaje(20));
    expect(r.subtotalConDescuento).toBe(0);
    expect(r.ahorroTotal).toBe(0);
  });

  // ──────────────────────────────────────────────
  // DESCUENTO_PORCENTUAL
  // ──────────────────────────────────────────────
  test('porcentaje 20% sobre 100 × 2 → subtotal 160 y ahorro 40', () => {
    const r = calcularDescuentoItem(100, 2, promoPorcentaje(20));
    expect(r.precioUnitarioConDescuento).toBe(80);
    expect(r.subtotalConDescuento).toBe(160);
    expect(r.ahorroTotal).toBe(40);
  });

  test('porcentaje 100% → todo gratis', () => {
    const r = calcularDescuentoItem(50, 4, promoPorcentaje(100));
    expect(r.subtotalConDescuento).toBe(0);
    expect(r.ahorroTotal).toBe(200);
  });

  // ──────────────────────────────────────────────
  // NXM
  // ──────────────────────────────────────────────
  test('3x2 con cantidad 3 → paga 2 unidades', () => {
    const r = calcularDescuentoItem(100, 3, promoNxM(3, 2));
    expect(r.subtotalConDescuento).toBe(200);
    expect(r.ahorroTotal).toBe(100);
  });

  test('3x2 con cantidad 6 → paga 4 (dos grupos)', () => {
    const r = calcularDescuentoItem(100, 6, promoNxM(3, 2));
    expect(r.subtotalConDescuento).toBe(400);
    expect(r.ahorroTotal).toBe(200);
  });

  test('3x2 con cantidad 4 → paga 3 (un grupo + sobrante completo)', () => {
    const r = calcularDescuentoItem(100, 4, promoNxM(3, 2));
    expect(r.subtotalConDescuento).toBe(300);
    expect(r.ahorroTotal).toBe(100);
  });

  test('3x2 con cantidad 2 → no completa el grupo, sin descuento', () => {
    const r = calcularDescuentoItem(100, 2, promoNxM(3, 2));
    expect(r.subtotalConDescuento).toBe(200);
    expect(r.ahorroTotal).toBe(0);
  });

  test('NXM mal configurado (lleva <= paga) → sin descuento', () => {
    const r = calcularDescuentoItem(100, 5, promoNxM(2, 2));
    expect(r.subtotalConDescuento).toBe(500);
    expect(r.ahorroTotal).toBe(0);
  });

  // ──────────────────────────────────────────────
  // SEGUNDA_UNIDAD
  // ──────────────────────────────────────────────
  test('2da unidad 50% con cantidad 2 → paga 1.5 unidades', () => {
    const r = calcularDescuentoItem(100, 2, promoSegundaUnidad(50));
    expect(r.subtotalConDescuento).toBe(150);
    expect(r.ahorroTotal).toBe(50);
  });

  test('2da unidad 50% con cantidad 3 → un par con descuento + una entera', () => {
    const r = calcularDescuentoItem(100, 3, promoSegundaUnidad(50));
    expect(r.subtotalConDescuento).toBe(250);
    expect(r.ahorroTotal).toBe(50);
  });

  test('2da unidad 100% (gratis) con cantidad 4 → paga 2', () => {
    const r = calcularDescuentoItem(100, 4, promoSegundaUnidad(100));
    expect(r.subtotalConDescuento).toBe(200);
    expect(r.ahorroTotal).toBe(200);
  });

  test('2da unidad con cantidad 1 → sin pares, sin descuento', () => {
    const r = calcularDescuentoItem(100, 1, promoSegundaUnidad(50));
    expect(r.subtotalConDescuento).toBe(100);
    expect(r.ahorroTotal).toBe(0);
  });
});

describe('elegirMejorPromocion', () => {
  test('lista vacía → undefined', () => {
    expect(elegirMejorPromocion([])).toBeUndefined();
  });

  test('una sola promoción → devuelve esa misma', () => {
    const p = promoPorcentaje(10);
    expect(elegirMejorPromocion([p])).toBe(p);
  });

  test('elige la de mayor descuento efectivo entre porcentaje y NXM', () => {
    // 30% OFF vs. 3x2 (~33%) → gana NXM
    const porcentaje = promoPorcentaje(30);
    const nxm = promoNxM(3, 2);
    expect(elegirMejorPromocion([porcentaje, nxm])).toBe(nxm);
  });

  test('elige la de mayor descuento entre porcentaje y segunda unidad', () => {
    // 50% OFF vs. 2da unidad 50% (efectivo ~25%) → gana porcentaje
    const porcentaje = promoPorcentaje(50);
    const segunda = promoSegundaUnidad(50);
    expect(elegirMejorPromocion([porcentaje, segunda])).toBe(porcentaje);
  });
});

describe('describirPromocionAplicada', () => {
  test('porcentaje → "X% OFF"', () => {
    expect(describirPromocionAplicada(promoPorcentaje(15))).toBe('15% OFF');
  });

  test('NXM → "LLEVAxPAGA"', () => {
    expect(describirPromocionAplicada(promoNxM(3, 2))).toBe('3x2');
  });

  test('segunda unidad → "2da unidad X% OFF"', () => {
    expect(describirPromocionAplicada(promoSegundaUnidad(40))).toBe('2da unidad 40% OFF');
  });
});
