'use client';

/**
 * CartContext — estado global del carrito de compras.
 *
 * El carrito vive 100% en el cliente. Se persiste en localStorage para
 * sobrevivir a recargas. El backend solo se consulta en /validate y /checkout.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type { CartItem } from '@/lib/cart-types';


// Tipos internos


interface CartState {
  items: CartItem[];
  hidratado: boolean;
  ultimoAgregado: CartItem | null;
  drawerAbierto: boolean;
}

type CartAction =
  | { type: 'HIDRATAR'; items: CartItem[] }
  | { type: 'AGREGAR'; item: CartItem }
  | { type: 'QUITAR'; itemId: string }
  | { type: 'ACTUALIZAR_CANTIDAD'; itemId: string; cantidad: number }
  | { type: 'VACIAR' }
  | { type: 'CERRAR_CONFIRMACION' }
  | { type: 'ABRIR_DRAWER' }
  | { type: 'CERRAR_DRAWER' };

interface CartContextValue {
  state: CartState;
  cantidadTotal: number;
  subtotalEstimado: number;
  agregar: (item: CartItem) => void;
  quitar: (itemId: string) => void;
  actualizarCantidad: (itemId: string, cantidad: number) => void;
  vaciar: () => void;
  cerrarConfirmacion: () => void;
  abrirDrawer: () => void;
  cerrarDrawer: () => void;
}

// Constantes

const STORAGE_KEY = 'techpoint:cart';

const ESTADO_INICIAL: CartState = {
  items: [],
  hidratado: false,
  ultimoAgregado: null,
  drawerAbierto: false,
};

// Reducer (puro, testeable sin mocks)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HIDRATAR':
      return { ...state, items: action.items, hidratado: true };

    case 'AGREGAR': {
      const existente = state.items.find((i) => i.itemId === action.item.itemId);
      const nuevoUltimoAgregado: CartItem = { ...action.item };

      if (existente) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.itemId === action.item.itemId
              ? { ...i, cantidad: i.cantidad + action.item.cantidad }
              : i
          ),
          ultimoAgregado: nuevoUltimoAgregado,
        };
      }

      return {
        ...state,
        items: [...state.items, action.item],
        ultimoAgregado: nuevoUltimoAgregado,
      };
    }

    case 'QUITAR':
      return {
        ...state,
        items: state.items.filter((i) => i.itemId !== action.itemId),
      };

    case 'ACTUALIZAR_CANTIDAD': {
      if (action.cantidad <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.itemId !== action.itemId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.itemId === action.itemId ? { ...i, cantidad: action.cantidad } : i
        ),
      };
    }

    case 'VACIAR':
      return { ...state, items: [] };

    case 'CERRAR_CONFIRMACION':
      return { ...state, ultimoAgregado: null };

    case 'ABRIR_DRAWER':
      return { ...state, drawerAbierto: true };

    case 'CERRAR_DRAWER':
      return { ...state, drawerAbierto: false };

    default:
      return state;
  }
}

// Context

const CartContext = createContext<CartContextValue | null>(null);

// Provider
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, ESTADO_INICIAL);

  // Hidratar desde localStorage al montar (solo cliente).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const items = raw ? (JSON.parse(raw) as CartItem[]) : [];
      const itemsValidos = Array.isArray(items)
        ? items.filter(esCartItemValido)
        : [];
      dispatch({ type: 'HIDRATAR', items: itemsValidos });
    } catch {
      dispatch({ type: 'HIDRATAR', items: [] });
    }
  }, []);

  // Persistir en localStorage tras cualquier cambio post-hidratación.
  useEffect(() => {
    if (!state.hidratado) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // Storage lleno o deshabilitado, silenciamos.
    }
  }, [state.items, state.hidratado]);

  // Actions estables.
  const agregar = useCallback((item: CartItem) => {
    dispatch({ type: 'AGREGAR', item });
  }, []);

  const quitar = useCallback((itemId: string) => {
    dispatch({ type: 'QUITAR', itemId });
  }, []);

  const actualizarCantidad = useCallback((itemId: string, cantidad: number) => {
    dispatch({ type: 'ACTUALIZAR_CANTIDAD', itemId, cantidad });
  }, []);

  const vaciar = useCallback(() => {
    dispatch({ type: 'VACIAR' });
  }, []);

  const cerrarConfirmacion = useCallback(() => {
    dispatch({ type: 'CERRAR_CONFIRMACION' });
  }, []);

  const abrirDrawer = useCallback(() => {
    dispatch({ type: 'ABRIR_DRAWER' });
  }, []);

  const cerrarDrawer = useCallback(() => {
    dispatch({ type: 'CERRAR_DRAWER' });
  }, []);

  const cantidadTotal = useMemo(
    () => state.items.reduce((acc, i) => acc + i.cantidad, 0),
    [state.items]
  );

  const subtotalEstimado = useMemo(
    () =>
      parseFloat(
        state.items
          .reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0)
          .toFixed(2)
      ),
    [state.items]
  );

  const value: CartContextValue = {
    state,
    cantidadTotal,
    subtotalEstimado,
    agregar,
    quitar,
    actualizarCantidad,
    vaciar,
    cerrarConfirmacion,
    abrirDrawer,
    cerrarDrawer,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook de consumo

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart debe usarse dentro de <CartProvider>');
  }
  return ctx;
}

// Helpers

function esCartItemValido(x: unknown): x is CartItem {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.itemId === 'string' &&
    typeof o.nombre === 'string' &&
    typeof o.precioUnitario === 'number' &&
    typeof o.cantidad === 'number' &&
    o.cantidad > 0
  );
}