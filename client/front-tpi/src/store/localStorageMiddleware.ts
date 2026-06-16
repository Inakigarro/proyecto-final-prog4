/**
 * localStorageMiddleware — persiste el carrito en localStorage por usuario.
 *
 * La key se scopea con el ID del usuario autenticado:
 *   - Logueado: 'techpoint:cart:{userId}'
 *   - Sin sesión: 'techpoint:cart:guest'
 *
 * Solo persiste en acciones del carrito (prefijo 'cart/') para evitar
 * que al despachar acciones de auth se pise el storage del usuario
 * incorrecto durante la transición de sesión.
 */
import type { Middleware } from '@reduxjs/toolkit';
import type { RootState } from './index';

/** Construye la key de localStorage para el usuario dado. */
export function getStorageKey(userId?: string): string {
  return userId ? `techpoint:cart:${userId}` : 'techpoint:cart:guest';
}

export const localStorageMiddleware: Middleware<unknown, RootState> =
  (storeApi) => (next) => (action) => {
    const result = next(action);

    // Solo persistir en acciones del carrito
    const actionType = (action as { type?: string }).type ?? '';
    if (!actionType.startsWith('cart/')) return result;

    const state = storeApi.getState();

    // No pisar storage antes de hidratar
    if (!state.cart.hidratado || typeof window === 'undefined') return result;

    // Mientras hay un conflicto de login pendiente, el snapshot vivo está dentro
    // del slice (cart.conflictoLogin) y el localStorage debe mantenerse intacto.
    // Si persistimos `items=[]` ahora, perderíamos el carrito guardado del
    // usuario si refresca antes de elegir en el modal.
    if (state.cart.conflictoLogin) return result;

    try {
      const key = getStorageKey(state.auth.usuario?.id);
      window.localStorage.setItem(key, JSON.stringify(state.cart.items));
    } catch {
      // Storage lleno o deshabilitado, silenciamos.
    }

    return result;
  };