'use client';

/**
 * CartContext — adapter sobre Redux Toolkit.
 *
 * Este archivo solía contener toda la lógica del carrito (useReducer +
 * localStorage). Tras la migración a Redux, se mantiene únicamente como
 * adapter para no romper a los consumidores: la API pública (CartProvider
 * y useCart) sigue siendo idéntica, pero por dentro lee/escribe contra el
 * store de Redux.
 *
 * Componentes que consumen useCart() (CartIcon, CartDrawer, CartToast,
 * CartItemRow, CartPageClient, LoginGateModal, etc.) no necesitan
 * modificarse. Si en el futuro se decide migrarlos a useSelector /
 * useDispatch directos, este archivo se puede eliminar.
 */

import { useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  agregar as agregarAction,
  quitar as quitarAction,
  actualizarCantidad as actualizarCantidadAction,
  vaciar as vaciarAction,
  cerrarConfirmacion as cerrarConfirmacionAction,
  abrirDrawer as abrirDrawerAction,
  cerrarDrawer as cerrarDrawerAction,
  hidratar as hidratarAction,
} from '@/store/cartSlice';
import { getStorageKey } from '@/store/localStorageMiddleware';
import type { CartItem } from '@/lib/cart-types';
import type { CartState } from '@/store/cartSlice';


// API pública del hook (idéntica a la versión Context original).


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


// Componente interno: hidrata el store desde localStorage al montar
// y cada vez que cambia el usuario autenticado.


/**
 * Lee el carrito persistido en localStorage para el usuario actual y
 * dispara la acción `hidratar`. Se re-ejecuta cuando el usuario cambia
 * (login / logout) para cargar el carrito correcto.
 *
 * Espera a que auth termine de cargar (isCargando === false) para no
 * hidratar desde la key guest mientras se verifica el refresh token.
 */
function CartHidratator() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.auth.usuario?.id);
  const authCargando = useAppSelector((s) => s.auth.isCargando);

  useEffect(() => {
    // No hidratar mientras auth sigue verificando la sesión
    if (authCargando) return;

    try {
      const key = getStorageKey(userId);
      const raw = window.localStorage.getItem(key);
      const items = raw ? (JSON.parse(raw) as CartItem[]) : [];
      const itemsValidos = Array.isArray(items)
        ? items.filter(esCartItemValido)
        : [];
      dispatch(hidratarAction(itemsValidos));
    } catch {
      dispatch(hidratarAction([]));
    }
  }, [dispatch, userId, authCargando]);

  return null;
}


// Provider público.


/**
 * Envuelve a {children} con el <Provider> de Redux y monta el hidratador
 * del carrito. Se sigue exportando como CartProvider para que layout.tsx
 * no se modifique.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <CartHidratator />
      {children}
    </>
  );
}


// Hook de consumo.


/**
 * Hook de acceso al carrito. Internamente combina useAppSelector +
 * useAppDispatch del store de Redux, pero hacia afuera mantiene la
 * misma firma que la versión basada en Context, para no obligar a
 * cambiar los componentes que lo consumen.
 */
export function useCart(): CartContextValue {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.cart);

  // Derivados memoizados (equivalentes a los del Context original).
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

  // Actions estables (referencias constantes por uso de useCallback).
  const agregar = useCallback(
    (item: CartItem) => {
      dispatch(agregarAction(item));
    },
    [dispatch]
  );

  const quitar = useCallback(
    (itemId: string) => {
      dispatch(quitarAction(itemId));
    },
    [dispatch]
  );

  const actualizarCantidad = useCallback(
    (itemId: string, cantidad: number) => {
      dispatch(actualizarCantidadAction({ itemId, cantidad }));
    },
    [dispatch]
  );

  const vaciar = useCallback(() => {
    dispatch(vaciarAction());
  }, [dispatch]);

  const cerrarConfirmacion = useCallback(() => {
    dispatch(cerrarConfirmacionAction());
  }, [dispatch]);

  const abrirDrawer = useCallback(() => {
    dispatch(abrirDrawerAction());
  }, [dispatch]);

  const cerrarDrawer = useCallback(() => {
    dispatch(cerrarDrawerAction());
  }, [dispatch]);

  return {
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
}


// Helpers


/**
 * Valida que un objeto cargado desde localStorage sea un CartItem válido.
 * Previene errores si alguien manipula el storage o si cambian los tipos.
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