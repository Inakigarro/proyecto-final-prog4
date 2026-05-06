'use client';

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

interface CartState {
  items: CartItem[];
  hidratado: boolean;
}

type CartAction =
  | { type: 'HIDRATAR'; items: CartItem[] }
  | { type: 'AGREGAR'; item: CartItem }
  | { type: 'QUITAR'; itemId: string }
  | { type: 'ACTUALIZAR_CANTIDAD'; itemId: string; cantidad: number }
  | { type: 'VACIAR' };

interface CartContextValue {
  state: CartState;
  cantidadTotal: number;
  subtotalEstimado: number;

  /**
   * Agrega un item al carrito. Si ya existe, suma cantidades.
   * @param item Datos del item a agregar (debe traer cantidad >= 1).
   */
  agregar: (item: CartItem) => void;
  /** Elimina un item del carrito por id. */
  quitar: (itemId: string) => void;
  /**
   * Setea la cantidad de un item. Si la cantidad queda <= 0, lo elimina.
   * @param itemId    Id del item a modificar.
   * @param cantidad  Nueva cantidad (entero).
   */
  actualizarCantidad: (itemId: string, cantidad: number) => void;
  /** Vacía el carrito completo. */
  vaciar: () => void;
}

/** Key de localStorage donde se persiste el carrito. */
const STORAGE_KEY = 'techpoint:cart';

const ESTADO_INICIAL: CartState = {
  items: [],
  hidratado: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HIDRATAR':
      return { items: action.items, hidratado: true };

    case 'AGREGAR': {
      const existente = state.items.find((i) => i.itemId === action.item.itemId);

      // Si ya está, sumamos cantidades sin duplicar la fila.
      if (existente) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.itemId === action.item.itemId
              ? { ...i, cantidad: i.cantidad + action.item.cantidad }
              : i
          ),
        };
      }

      return { ...state, items: [...state.items, action.item] };
    }

    case 'QUITAR':
      return {
        ...state,
        items: state.items.filter((i) => i.itemId !== action.itemId),
      };

    case 'ACTUALIZAR_CANTIDAD': {
      // Cantidad <= 0 equivale a quitar el item del carrito.
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

    default:
      return state;
  }
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Provider del carrito. Debe envolver toda la app (típicamente en layout.tsx).
 * Maneja la hidratación desde localStorage en el primer render del cliente
 * y persiste cambios en cada actualización posterior.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, ESTADO_INICIAL);

  // Hidratar desde localStorage al montar (solo cliente).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const items = raw ? (JSON.parse(raw) as CartItem[]) : [];
      // Sanity check: si alguien manipuló el storage, ignoramos lo inválido.
      const itemsValidos = Array.isArray(items)
        ? items.filter(esCartItemValido)
        : [];
      dispatch({ type: 'HIDRATAR', items: itemsValidos });
    } catch {
      // localStorage corrupto o no disponible: arrancamos con carrito vacío.
      dispatch({ type: 'HIDRATAR', items: [] });
    }
  }, []);

  // Persistir en localStorage tras cualquier cambio post-hidratación.
  useEffect(() => {
    if (!state.hidratado) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
    }
  }, [state.items, state.hidratado]);

  // Actions estables (referencia constante) para no romper memos en consumers.
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

  // Derivados memoizados.
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
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Hook para consumir el carrito desde cualquier client component.
 * Lanza error si se usa fuera de CartProvider — esto detecta bugs temprano.
 */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart debe usarse dentro de <CartProvider>');
  }
  return ctx;
}

/**
 * valida que un objeto deserializado de localStorage
 * tenga la forma esperada de CartItem.
 */
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