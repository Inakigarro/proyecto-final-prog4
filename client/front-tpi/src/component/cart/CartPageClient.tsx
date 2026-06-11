'use client';

/**
 * Página completa del carrito.
 *
 * La validación contra POST /api/cart/validate vive en el slice de Redux
 * (`store/cartSlice`). Este componente solo consume el resultado vía el
 * hook compartido `useValidacionCarrito`, que dispara la validación con
 * debounce y comparte el estado con el mini-cart drawer.
 *
 * El botón "Confirmar compra" requiere usuario autenticado. Si no lo está,
 * abre el LoginGateModal.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import CartItemRow from './CartItemRow';
import ConfirmDialog from './ConfirmDialog';
import LoginGateModal from './LoginGateModal';
import { useValidacionCarrito } from './useValidacionCarrito';
import './CartPageClient.css';

const CartPageClient = () => {
  const { state, subtotalEstimado, vaciar } = useCart();
  const { state: authState } = useAuth();
  const validacion = useValidacionCarrito();
  const [confirmacionVaciarAbierta, setConfirmacionVaciarAbierta] = useState(false);
  const [loginAbierto, setLoginAbierto] = useState(false);

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

  // Mapa itemId -> ItemValidado para enriquecer cada fila
  const validadosPorId =
    validacion.tipo === 'ok'
      ? new Map(validacion.data.items.map((v) => [v.itemId, v]))
      : null;

  // Totales del backend (con promos aplicadas) o fallback al estimado local
  const totalAMostrar =
    validacion.tipo === 'ok' ? validacion.data.total : subtotalEstimado;
  const subtotalSinDescuentos =
    validacion.tipo === 'ok'
      ? validacion.data.subtotalSinDescuentos
      : subtotalEstimado;
  const ahorroTotal =
    validacion.tipo === 'ok' ? validacion.data.ahorroTotal : 0;
  const hayAhorro = ahorroTotal > 0;

  // Botón Confirmar compra habilitado solo con sesión activa + carrito válido
  const puedeConfirmar =
    validacion.tipo === 'ok' &&
    validacion.data.carritoValido &&
    authState.isAutenticado;

  const handleConfirmarCompra = () => {
    if (!authState.isAutenticado) {
      setLoginAbierto(true);
      return;
    }
    // TODO: implementar llamada a POST /api/cart/checkout
  };

  const handleConfirmarVaciar = () => {
    vaciar();
    setConfirmacionVaciarAbierta(false);
  };

  return (
    <div className="cart-page">
      <header className="cart-page-header">
        <h1>Mi carrito</h1>
        <button
          type="button"
          className="cart-page-vaciar"
          onClick={() => setConfirmacionVaciarAbierta(true)}
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
              Necesitás iniciar sesión para continuar.{' '}
              <button
                type="button"
                className="cart-page-error-login"
                onClick={() => setLoginAbierto(true)}
              >
                Iniciar sesión
              </button>
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

          {/* Desglose: subtotal sin descuentos, ahorro y total final */}
          {hayAhorro && (
            <>
              <div className="cart-page-resumen-fila cart-page-resumen-fila-secundaria">
                <span>Subtotal</span>
                <span>${subtotalSinDescuentos.toLocaleString('es-AR')}</span>
              </div>
              <div className="cart-page-resumen-fila cart-page-resumen-fila-ahorro">
                <span>Descuentos por promociones</span>
                <span>−${ahorroTotal.toLocaleString('es-AR')}</span>
              </div>
            </>
          )}

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
            disabled={validacion.tipo === 'ok' && !validacion.data.carritoValido}
            onClick={handleConfirmarCompra}
            title={
              !authState.isAutenticado
                ? 'Iniciá sesión para confirmar la compra'
                : puedeConfirmar
                  ? 'Confirmar compra (próximo paso)'
                  : 'Hay items con problemas o el carrito no fue validado'
            }
          >
            {authState.isAutenticado
              ? 'Confirmar compra'
              : 'Iniciar sesión para comprar'}
          </button>

          <Link href="/" className="cart-page-cta-secondary">
            Seguir comprando
          </Link>
        </aside>
      </div>

      <ConfirmDialog
        abierto={confirmacionVaciarAbierta}
        titulo="Vaciar carrito"
        mensaje="¿Seguro que querés vaciar todo el carrito? Esta acción no se puede deshacer."
        textoConfirmar="Sí, vaciar"
        textoCancelar="Cancelar"
        destructivo
        onConfirmar={handleConfirmarVaciar}
        onCancelar={() => setConfirmacionVaciarAbierta(false)}
      />

      <LoginGateModal
        abierto={loginAbierto}
        onCerrar={() => setLoginAbierto(false)}
      />
    </div>
  );
};

export default CartPageClient;
