'use client';

/**
 * Modal de resolución del conflicto entre el carrito guest y el carrito
 * guardado de la sesión anterior. Se monta globalmente en el layout y se
 * activa cuando `cart.conflictoLogin` no es null.
 *
 * Al confirmar:
 * 1. Persiste el carrito elegido en la key del usuario logueado.
 * 2. Limpia la key guest.
 * 3. Despacha `resolverConflictoLogin` para terminar el conflicto en el slice
 *    (el middleware después seguirá persistiendo las acciones del cart como
 *    siempre).
 */

import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  resolverConflictoLogin as resolverAction,
  combinarCarritos,
  type EleccionConflicto,
} from '@/store/cartSlice';
import { getStorageKey } from '@/store/localStorageMiddleware';
import OpcionCarrito from './_components/OpcionCarrito';
import './ConflictoCarritoModal.css';

const ConflictoCarritoModal = () => {
  const dispatch = useAppDispatch();
  const conflicto = useAppSelector((s) => s.cart.conflictoLogin);
  const userId = useAppSelector((s) => s.auth.usuario?.id);

  /** Opción seleccionada por el usuario. Empieza null para forzar la elección. */
  const [eleccion, setEleccion] = useState<EleccionConflicto | null>(null);

  // Preview del carrito combinado, derivado solo si hay conflicto activo.
  const itemsCombinados = useMemo(() => {
    if (!conflicto) return [];
    return combinarCarritos(conflicto.guestItems, conflicto.userItems);
  }, [conflicto]);

  // Al reabrirse el modal (nuevo conflicto), resetear la elección previa.
  useEffect(() => {
    if (conflicto) setEleccion(null);
  }, [conflicto]);

  if (!conflicto) return null;

  const confirmar = () => {
    if (!eleccion || !userId) return;

    const itemsElegidos = (() => {
      switch (eleccion) {
        case 'guest': return conflicto.guestItems;
        case 'user': return conflicto.userItems;
        case 'merge': return itemsCombinados;
      }
    })();

    try {
      const userKey = getStorageKey(userId);
      window.localStorage.setItem(userKey, JSON.stringify(itemsElegidos));
      window.localStorage.removeItem(getStorageKey());
    } catch {
      // Storage lleno o deshabilitado, igual resolvemos en memoria.
    }

    dispatch(resolverAction(eleccion));
  };

  return (
    <div
      className="conflicto-carrito-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="conflicto-carrito-titulo"
    >
      <div className="conflicto-carrito-modal">
        <header className="conflicto-carrito-encabezado">
          <h2 id="conflicto-carrito-titulo" className="conflicto-carrito-titulo">
            ¿Con qué carrito seguimos?
          </h2>
          <p className="conflicto-carrito-subtitulo">
            Tenías un carrito armado y además había uno guardado de tu sesión
            anterior. Elegí con cuál querés continuar.
          </p>
        </header>

        <div className="conflicto-carrito-opciones">
          <OpcionCarrito
            id="guest"
            titulo="Carrito actual"
            descripcion="Lo que armaste antes de iniciar sesión"
            items={conflicto.guestItems}
            seleccionado={eleccion === 'guest'}
            alSeleccionar={() => setEleccion('guest')}
          />
          <OpcionCarrito
            id="user"
            titulo="Carrito guardado"
            descripcion="Lo que tenías de tu sesión anterior"
            items={conflicto.userItems}
            seleccionado={eleccion === 'user'}
            alSeleccionar={() => setEleccion('user')}
          />
          <OpcionCarrito
            id="merge"
            titulo="Combinar ambos"
            descripcion="Suma las cantidades de los productos repetidos"
            items={itemsCombinados}
            seleccionado={eleccion === 'merge'}
            alSeleccionar={() => setEleccion('merge')}
          />
        </div>

        <footer className="conflicto-carrito-footer">
          <button
            type="button"
            className="conflicto-carrito-confirmar"
            onClick={confirmar}
            disabled={!eleccion}
          >
            Continuar con este carrito
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ConflictoCarritoModal;
