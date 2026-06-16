'use client';

/**
 * Stepper visual para el flujo de checkout.
 * Muestra los 3 pasos: Carrito → Datos de envío → Pago.
 *
 * Cada paso se renderiza en una columna (círculo arriba, label abajo)
 * para mantener la simetría visual y que los nombres más largos
 * (ej. "Datos de envío") no descoloquen los círculos.
 */

import { Fragment } from 'react';
import './CheckoutStepper.css';

export type PasoCheckout = 'carrito' | 'envio' | 'pago' | 'confirmacion';

interface CheckoutStepperProps {
  pasoActual: PasoCheckout;
}

const PASOS: { id: PasoCheckout; label: string; numero: number }[] = [
  { id: 'carrito', label: 'Carrito', numero: 1 },
  { id: 'envio', label: 'Datos de envío', numero: 2 },
  { id: 'pago', label: 'Pago', numero: 3 },
];

/** Convierte un paso a su índice numérico. */
function indice(paso: PasoCheckout): number {
  if (paso === 'confirmacion') return 3;
  const idx = PASOS.findIndex((p) => p.id === paso);
  return idx >= 0 ? idx : 0;
}

const CheckoutStepper = ({ pasoActual }: CheckoutStepperProps) => {
  const actual = indice(pasoActual);

  return (
    <nav className="stepper" aria-label="Pasos del checkout">
      {PASOS.map((paso, i) => {
        const completado = i < actual;
        const activo = i === actual;

        return (
          <Fragment key={paso.id}>
            {/* Línea conectora entre el paso anterior y este (no aparece antes del primero) */}
            {i > 0 && (
              <div
                className={`stepper-linea ${completado || activo ? 'stepper-linea-activa' : ''}`}
              />
            )}

            <div className="stepper-paso">
              <div
                className={`stepper-circulo ${
                  completado
                    ? 'stepper-circulo-completado'
                    : activo
                      ? 'stepper-circulo-activo'
                      : ''
                }`}
              >
                {completado ? '✓' : paso.numero}
              </div>

              <span
                className={`stepper-label ${
                  activo ? 'stepper-label-activo' : completado ? 'stepper-label-completado' : ''
                }`}
              >
                {paso.label}
              </span>
            </div>
          </Fragment>
        );
      })}
    </nav>
  );
};

export default CheckoutStepper;
