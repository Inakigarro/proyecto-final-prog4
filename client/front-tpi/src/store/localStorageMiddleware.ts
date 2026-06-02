/**
 * localStorageMiddleware — persiste el carrito en localStorage.
 *
 * Se ejecuta después de cada action y vuelca state.cart.items en
 * localStorage bajo la key 'techpoint:cart'. Mantiene la misma key y
 * formato que la implementación previa con Context, así no rompemos
 * carritos existentes de usuarios actuales.
 *
 * No persiste mientras el estado no esté hidratado (evita pisar el
 * storage con el array vacío del estado inicial antes de leerlo).
 */

import type { Middleware } from '@reduxjs/toolkit';
import type { RootState } from './index';

export const STORAGE_KEY = 'techpoint:cart';

export const localStorageMiddleware: Middleware<unknown, RootState> =
  (storeApi) => (next) => (action) => {
    const result = next(action);
    const state = storeApi.getState();

    // Solo persistir cuando el estado ya esté hidratado, para no pisar
    // el contenido de localStorage con el array vacío inicial.
    if (state.cart.hidratado && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(state.cart.items)
        );
      } catch {
        // Storage lleno o deshabilitado, silenciamos.
      }
    }

    return result;
  };