/**
 * cartSlice — slice de Redux para el carrito de compras.
 *
 * Define el estado, las acciones y los reducers del carrito. Equivalente al
 * cartReducer + acciones que existían en CartContext, pero usando RTK +
 * Immer (permite escribir mutaciones que internamente son inmutables).
 *
 * No persiste por sí mismo: la persistencia en localStorage se maneja
 * desde el middleware (localStorageMiddleware.ts) para mantener este slice
 * puro y testeable.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '@/lib/cart-types';

/** Estado interno del carrito. */
export interface CartState {
  items: CartItem[];
  hidratado: boolean;
  ultimoAgregado: CartItem | null;
  drawerAbierto: boolean;
}

const ESTADO_INICIAL: CartState = {
  items: [],
  hidratado: false,
  ultimoAgregado: null,
  drawerAbierto: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: ESTADO_INICIAL,
  reducers: {
    /** Hidrata el estado desde la fuente persistida (localStorage). */
    hidratar(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      state.hidratado = true;
    },

    /**
     * Agrega un item. Si ya existe (mismo itemId), suma la cantidad.
     * Setea ultimoAgregado para disparar el toast.
     */
    agregar(state, action: PayloadAction<CartItem>) {
      const incoming = action.payload;
      const existente = state.items.find((i) => i.itemId === incoming.itemId);

      if (existente) {
        existente.cantidad += incoming.cantidad;
      } else {
        state.items.push(incoming);
      }

      state.ultimoAgregado = { ...incoming };
    },

    /** Quita un item del carrito por id. */
    quitar(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.itemId !== action.payload);
    },

    /**
     * Cambia la cantidad de un item. Si la cantidad nueva es <= 0,
     * elimina el item.
     */
    actualizarCantidad(
      state,
      action: PayloadAction<{ itemId: string; cantidad: number }>
    ) {
      const { itemId, cantidad } = action.payload;
      if (cantidad <= 0) {
        state.items = state.items.filter((i) => i.itemId !== itemId);
        return;
      }
      const item = state.items.find((i) => i.itemId === itemId);
      if (item) item.cantidad = cantidad;
    },

    /** Vacía completamente el carrito. */
    vaciar(state) {
      state.items = [];
    },

    /** Cierra el toast de confirmación (limpia ultimoAgregado). */
    cerrarConfirmacion(state) {
      state.ultimoAgregado = null;
    },

    /** Abre el drawer lateral del carrito. */
    abrirDrawer(state) {
      state.drawerAbierto = true;
    },

    /** Cierra el drawer lateral del carrito. */
    cerrarDrawer(state) {
      state.drawerAbierto = false;
    },
  },
});

export const {
  hidratar,
  agregar,
  quitar,
  actualizarCantidad,
  vaciar,
  cerrarConfirmacion,
  abrirDrawer,
  cerrarDrawer,
} = cartSlice.actions;

export default cartSlice.reducer;