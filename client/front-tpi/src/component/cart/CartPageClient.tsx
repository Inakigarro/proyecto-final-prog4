'use client';

/**
 * Validación:
 *  - Se llama POST /api/cart/validate al montar y cuando cambia el carrito.
 *  - Debounce de 500ms para no spamear si el usuario edita rápido.
 *  - Si la validación falla (red, 401, etc.), se muestra el carrito local
 *    con un banner de error y el botón Confirmar deshabilitado.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { apiFetch, ApiError } from '@/lib/api';
import type {
  ValidacionCarritoResponse,
  ValidarCarritoDto,
} from '@/lib/cart-types';
import CartItemRow from './CartItemRow';
import './CartPageClient.css';

/** Tiempo de espera tras el último cambio antes de pegar al backend. */
const DEBOUNCE_MS = 500;

type EstadoValidacion =
  | { tipo: 'idle' }
  | { tipo: 'cargando' }
  | { tipo: 'ok'; data: ValidacionCarritoResponse }
  | { tipo: 'error'; mensaje: string; status: number };

const CartPageClient = () => {
  const { state, subtotalEstimado, vaciar } = useCart();
  const [validacion, setValidacion] = useState<EstadoValidacion>({ tipo: 'idle' });

  // Refs para debounce y para descartar respuestas obsoletas.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ultimoFetchIdRef = useRef(0);

  useEffect(() => {
    // No validar si: aún no hidratamos, o no hay items.
    if (!state.hidratado) return;
    if (state.items.length === 0) {
      setValidacion({ tipo: 'idle' });
      return;
    }

    // Limpiar timer anterior: solo el último cambio dispara fetch.
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const fetchId = ++ultimoFetchIdRef.current;
      setValidacion({ tipo: 'cargando' });

      const body: ValidarCarritoDto = {
        items: state.items.map((i) => ({
          itemId: i.itemId,
          cantidad: i.cantidad,
        })),
      };

      apiFetch<ValidacionCarritoResponse>('/api/cart/validate', {
        method: 'POST',
        body: JSON.stringify(body),
      })
        .then((data) => {
          // Descartar respuesta si hubo otro fetch posterior.
          if (fetchId !== ultimoFetchIdRef.current) return;
          setValidacion({ tipo: 'ok', data });
        })
        .catch((err: unknown) => {
          if (fetchId !== ultimoFetchIdRef.current) return;
          if (err instanceof ApiError) {
            setValidacion({
              tipo: 'error',
              mensaje: err.message,
              status: err.status,
            });
          } else {
            setValidacion({
              tipo: 'error',
              mensaje: 'Error inesperado al validar el carrito.',
              status: 0,
            });
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.hidratado, state.items]);

  if (!state.hidratado) {
    return (
      <div className="cart-page">
        <p className="cart-page-loading">Cargando carrito...</p>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-page-empty">
          <h1>Tu carrito está vacío</h1>
          <p>Todavía no agregaste productos. Volvé al inicio para explorar.</p>
          <Link href="/" className="cart-page-cta-primary">
            Ir a la tienda
          </Link>
        </div>
      </div>
    );
  }

  // Mapa itemId -> ItemValidado para enriquecer cada fila.
  const validadosPorId =
    validacion.tipo === 'ok'
      ? new Map(validacion.data.items.map((v) => [v.itemId, v]))
      : null;

  // Total a mostrar: el del backend si está validado, sino el local.
  const totalAMostrar =
    validacion.tipo === 'ok' ? validacion.data.total : subtotalEstimado;

  // Botón "Confirmar compra" habilitado solo en condiciones buenas.
  const puedeConfirmar =
    validacion.tipo === 'ok' && validacion.data.carritoValido;

  return (
    <div className="cart-page">
      <header className="cart-page-header">
        <h1>Mi carrito</h1>
        <button
          type="button"
          className="cart-page-vaciar"
          onClick={() => {
            if (window.confirm('¿Vaciar todo el carrito?')) {
              vaciar();
            }
          }}
        >
          Vaciar carrito
        </button>
      </header>

      {/* Banner de error de validación, sin bloquear la edición. */}
      {validacion.tipo === 'error' && (
        <div className="cart-page-error" role="alert">
          <strong>No se pudo validar el carrito.</strong>{' '}
          {validacion.status === 401 ? (
            <>
              Tu sesión expiró. Renová el token de prueba en{' '}
              <code>.env.local</code> y reiniciá el dev server.
            </>
          ) : (
            <>{validacion.mensaje}</>
          )}
        </div>
      )}

      {/* Banner de validación con items inválidos. */}
      {validacion.tipo === 'ok' && !validacion.data.carritoValido && (
        <div className="cart-page-warning" role="alert">
          Hay items con problemas (sin stock o no disponibles). Revisalos antes
          de continuar.
        </div>
      )}

      <div className="cart-page-grid">
        <section className="cart-page-items" aria-label="Items del carrito">
          {state.items.map((item) => (
            <CartItemRow
              key={item.itemId}
              item={item}
              validado={validadosPorId?.get(item.itemId) ?? null}
            />
          ))}
        </section>

        <aside className="cart-page-resumen" aria-label="Resumen de la compra">
          <h2>Resumen</h2>

          <div className="cart-page-resumen-fila">
            <span>{validacion.tipo === 'ok' ? 'Total' : 'Subtotal'}</span>
            <strong>${totalAMostrar.toLocaleString('es-AR')}</strong>
          </div>

          {validacion.tipo === 'cargando' && (
            <p className="cart-page-resumen-validando">Validando precios...</p>
          )}

          {validacion.tipo === 'idle' && (
            <p className="cart-page-resumen-nota">
              El total se confirmará al validar el carrito.
            </p>
          )}

          {validacion.tipo === 'error' && (
            <p className="cart-page-resumen-nota">
              El total final se confirma al finalizar la compra.
            </p>
          )}

          <button
            type="button"
            className="cart-page-cta-primary"
            disabled={!puedeConfirmar}
            title={
              puedeConfirmar
                ? 'Confirmar compra (próximo paso)'
                : 'Hay items con problemas o el carrito no fue validado'
            }
          >
            Confirmar compra
          </button>

          <Link href="/" className="cart-page-cta-secondary">
            Seguir comprando
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default CartPageClient;