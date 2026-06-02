/**
 * Store de Redux para la aplicación.
 *
 * Configura el store global con configureStore (RTK), registra los
 * slices y monta el middleware de persistencia en localStorage.
 *
 * Por ahora solo contiene el slice del carrito; cuando se sumen más
 * slices (auth, ordenes, etc.) se agregan al objeto reducer.
 */

import { configureStore } from '@reduxjs/toolkit';
import cartReducer, { type CartState } from './cartSlice';
import { localStorageMiddleware } from './localStorageMiddleware';

/**
 * Tipo del estado completo del store.
 *
 * Se define explícitamente acá (en vez de inferirlo de store.getState)
 * para romper la dependencia circular con localStorageMiddleware, que
 * necesita RootState antes de que store esté construido.
 */
export interface RootState {
  cart: CartState;
}

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});

/** Tipo del dispatch del store. Usado por los hooks tipados. */
export type AppDispatch = typeof store.dispatch;