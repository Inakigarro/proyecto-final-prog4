'use client';

/**
 * Hook que orquesta la validación del carrito contra el backend.
 *
 * Lee el estado de validación desde el store de Redux y dispara nuevas
 * validaciones (con debounce de 500ms) cuando cambian los items o el
 * flag `habilitado`. La cancelación de respuestas obsoletas vive dentro
 * del slice (vía `requestIdValidacion`).
 *
 * Lo usan tanto `CartDrawer` (con `habilitado = abierto` para no validar
 * mientras el drawer está cerrado) como `CartPageClient`.
 */

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  resetValidacion,
  validarCarrito,
  type EstadoValidacion,
} from '@/store/cartSlice';

/** Tiempo de espera tras el último cambio antes de pegar al backend. */
const DEBOUNCE_MS = 500;

interface OpcionesValidacion {
  /**
   * Si es false, el hook deja de disparar validaciones. Útil para que el
   * mini-cart drawer solo valide cuando está abierto. Default: true.
   */
  habilitado?: boolean;
}

export const useValidacionCarrito = (
  opciones: OpcionesValidacion = {},
): EstadoValidacion => {
  const { habilitado = true } = opciones;
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);
  const hidratado = useAppSelector((s) => s.cart.hidratado);
  const validacion = useAppSelector((s) => s.cart.validacion);

  useEffect(() => {
    if (!habilitado || !hidratado) return;

    // Carrito vacío: reset al estado idle y no disparar nada
    if (items.length === 0) {
      dispatch(resetValidacion());
      return;
    }

    const timer = setTimeout(() => {
      dispatch(
        validarCarrito({
          items: items.map((item) => ({
            itemId: item.itemId,
            cantidad: item.cantidad,
          })),
        }),
      );
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [habilitado, hidratado, items, dispatch]);

  return validacion;
};
