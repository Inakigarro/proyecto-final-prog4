'use client';

/**
 * Página completa del carrito + flujo de checkout.
 *
 * Maneja 3 pasos dentro de la misma pantalla:
 *  1. `carrito` — Vista del carrito con botón "Confirmar compra".
 *  2. `envio`   — Formulario de datos de envío; botón pasa a "Ir a pagar".
 *  3. `pago`    — Formulario de tarjeta de crédito (Etapa 3, próximamente).
 *
 * La validación contra POST /api/cart/validate vive en el slice de Redux.
 */

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import CartItemRow from './CartItemRow';
import ConfirmDialog from './ConfirmDialog';
import CheckoutEnvioForm from './CheckoutEnvioForm';
import { useValidacionCarrito } from './useValidacionCarrito';
import type { DatosEnvioDto } from '@/lib/cart-types';
import './CartPageClient.css';

/** Pasos del flujo de checkout. */
type PasoCheckout = 'carrito' | 'envio' | 'pago' | 'confirmacion';

const CartPageClient = () => {
  const { state, subtotalEstimado, vaciar } = useCart();
  const { state: authState } = useAuth();
  const validacion = useValidacionCarrito();
  const router = useRouter();

  const [confirmacionVaciarAbierta, setConfirmacionVaciarAbierta] = useState(false);
  const [paso, setPaso] = useState<PasoCheckout>('carrito');
  const [datosEnvio, setDatosEnvio] = useState<DatosEnvioDto | null>(null);
  const [envioValido, setEnvioValido] = useState(false);

  // ── Callbacks ────────────────────────────────────────────────────────────

  /** Recibe cambios del formulario de envío. */
  const handleEnvioChange = useCallback(
    (datos: DatosEnvioDto, esValido: boolean) => {
      setDatosEnvio(datos);
      setEnvioValido(esValido);
    },
    []
  );

  const handleConfirmarVaciar = () => {
    vaciar();
    setConfirmacionVaciarAbierta(false);
    setPaso('carrito');
  };

  // ── Lógica del botón principal ───────────────────────────────────────────

  const handleBotonPrincipal = () => {
    if (!authState.isAutenticado) {
      router.push('/login?redirect=/carrito');
      return;
    }

    switch (paso) {
      case 'carrito':
        setPaso('envio');
        break;
      case 'envio':
        if (envioValido && datosEnvio) {
          setPaso('pago');
        }
        break;
      case 'pago':
        // TODO: Etapa 3 — procesar pago
        break;
    }
  };

  /** Texto del botón según el paso actual. */
  const textoBotonPrincipal = (): string => {
    if (!authState.isAutenticado) return 'Iniciar sesión para comprar';
    switch (paso) {
      case 'carrito':
        return 'Confirmar compra';
      case 'envio':
        return 'Ir a pagar';
      case 'pago':
        return 'Confirmar pago';
      default:
        return 'Confirmar compra';
    }
  };

  /** El botón está deshabilitado según el paso y la validación. */
  const botonDeshabilitado = (): boolean => {
    if (validacion.tipo === 'ok' && !validacion.data.carritoValido) return true;
    switch (paso) {
      case 'carrito':
        return false;
      case 'envio':
        return !envioValido;
      case 'pago':
        return true;
      default:
        return true;
    }
  };

  /** Volver al paso anterior. */
  const handleVolver = () => {
    switch (paso) {
      case 'envio':
        setPaso('carrito');
        break;
      case 'pago':
        setPaso('envio');
        break;
    }
  };

  // ── Renders condicionales tempranos ──────────────────────────────────────

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

  // ── Datos derivados ──────────────────────────────────────────────────────

  const validadosPorId =
    validacion.tipo === 'ok'
      ? new Map(validacion.data.items.map((v) => [v.itemId, v]))
      : null;

  const totalAMostrar =
    validacion.tipo === 'ok' ? validacion.data.total : subtotalEstimado;
  const subtotalSinDescuentos =
    validacion.tipo === 'ok'
      ? validacion.data.subtotalSinDescuentos
      : subtotalEstimado;
  const ahorroTotal =
    validacion.tipo === 'ok' ? validacion.data.ahorroTotal : 0;
  const hayAhorro = ahorroTotal > 0;

  const valoresInicialesEnvio = authState.usuario
    ? {
        nombre: authState.usuario.nombre,
        apellido: authState.usuario.apellido,
        direccion: authState.usuario.direccion ?? '',
        telefono: authState.usuario.telefono ?? '',
      }
    : undefined;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="cart-page">
      <header className="cart-page-header">
        <h1>Mi carrito</h1>
        {paso === 'carrito' && (
          <button
            type="button"
            className="cart-page-vaciar"
            onClick={() => setConfirmacionVaciarAbierta(true)}
          >
            Vaciar carrito
          </button>
        )}
        {paso !== 'carrito' && (
          <button
            type="button"
            className="cart-page-volver"
            onClick={handleVolver}
          >
            ← Volver
          </button>
        )}
      </header>

      {/* Banners de validación */}
      {validacion.tipo === 'error' && (
        <div className="cart-page-error" role="alert">
          <strong>No se pudo validar el carrito.</strong>{' '}
          {validacion.status === 401 ? (
            <>
              Necesitás iniciar sesión para continuar.{' '}
              <button
                type="button"
                className="cart-page-error-login"
                onClick={() => router.push('/login?redirect=/carrito')}
              >
                Iniciar sesión
              </button>
            </>
          ) : (
            <>{validacion.mensaje}</>
          )}
        </div>
      )}

      {validacion.tipo === 'ok' && !validacion.data.carritoValido && (
        <div className="cart-page-warning" role="alert">
          Hay items con problemas (sin stock o no disponibles). Revisalos antes
          de continuar.
        </div>
      )}

      <div className="cart-page-grid">
        {/* ── Columna izquierda: items + formularios ───────────────────── */}
        <section className="cart-page-items" aria-label="Items del carrito">
          {state.items.map((item) => (
            <CartItemRow
              key={item.itemId}
              item={item}
              validado={validadosPorId?.get(item.itemId) ?? null}
            />
          ))}

          {/* Formulario de envío debajo de los items */}
          {paso === 'envio' && (
            <CheckoutEnvioForm
              valoresIniciales={valoresInicialesEnvio}
              onChange={handleEnvioChange}
            />
          )}
        </section>

        {/* ── Columna derecha: resumen (sticky) ────────────────────────── */}
        <aside className="cart-page-resumen" aria-label="Resumen de la compra">
          <h2>Resumen</h2>

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
            disabled={botonDeshabilitado()}
            onClick={handleBotonPrincipal}
          >
            {textoBotonPrincipal()}
          </button>

          {paso === 'carrito' && (
            <Link href="/" className="cart-page-cta-secondary">
              Seguir comprando
            </Link>
          )}
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
    </div>
  );
};

export default CartPageClient;