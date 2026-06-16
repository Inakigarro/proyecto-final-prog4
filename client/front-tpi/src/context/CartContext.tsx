'use client';

/**
 * CartContext — adapter sobre Redux Toolkit.
 *
 * Este archivo solía contener toda la lógica del carrito (useReducer +
 * localStorage). Tras la migración a Redux, se mantiene únicamente como
 * adapter para no romper a los consumidores: la API pública (CartProvider
 * y useCart) sigue siendo idéntica, pero por dentro lee/escribe contra el
 * store de Redux.
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
  iniciarConflictoLogin as iniciarConflictoLoginAction,
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
 * Lee el carrito persistido en localStorage para la key indicada y lo
 * devuelve como un array de items válidos. Si la key no existe, está mal
 * formada o tiene items inválidos, devuelve un array vacío.
 */
function leerCartLocal(key: string): CartItem[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parseado = JSON.parse(raw) as unknown;
    if (!Array.isArray(parseado)) return [];
    return parseado.filter(esCartItemValido);
  } catch {
    return [];
  }
}

/**
 * Mantiene sincronizado el carrito con el storage del usuario actual.
 *
 * Reglas al loguearse:
 * - Sin carrito guest: hidrata desde la key del usuario sin pisar nada.
 * - Carrito guest + key del usuario vacía: transfiere el guest al usuario.
 * - Carrito guest + carrito guardado del usuario: dispara conflicto; el modal
 *   le pide al usuario elegir con cuál seguir y resuelve la persistencia.
 *
 * Mientras la sesión está activa, el middleware persiste cada acción del
 * carrito en `techpoint:cart:{userId}`. La limpieza al cerrar sesión y al
 * confirmar la compra ocurre fuera (AuthContext.logout / CartPageClient).
 */
function CartHidratator() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.auth.usuario?.id);
  const authCargando = useAppSelector((s) => s.auth.isCargando);

  useEffect(() => {
    if (authCargando) return;
    if (typeof window === 'undefined') return;

    const guestKey = getStorageKey();
    const guestItems = leerCartLocal(guestKey);

    if (!userId) {
      // Sin sesión: el carrito visible es el guest.
      dispatch(hidratarAction(guestItems));
      return;
    }

    const userKey = getStorageKey(userId);
    const userItems = leerCartLocal(userKey);

    // Conflicto: el usuario armó algo como guest y además tenía algo guardado
    // de una sesión anterior. La elección la hace el usuario via modal.
    if (guestItems.length > 0 && userItems.length > 0) {
      dispatch(iniciarConflictoLoginAction({ guestItems, userItems }));
      return;
    }

    // Carrito guest no vacío y user sin carrito previo: lo transferimos.
    if (guestItems.length > 0) {
      try {
        window.localStorage.setItem(userKey, JSON.stringify(guestItems));
        window.localStorage.removeItem(guestKey);
      } catch {
        // Storage lleno o deshabilitado, igual hidratamos con los items en memoria.
      }
      dispatch(hidratarAction(guestItems));
      return;
    }

    // Sin carrito guest: cargar el carrito guardado del usuario (si lo tiene).
    dispatch(hidratarAction(userItems));
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
