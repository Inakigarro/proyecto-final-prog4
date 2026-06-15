'use client';

/**
 * Página del carrito + flujo de checkout por pasos (full-page).
 *
 * Paso 1: Carrito (items + resumen).
 * Paso 2: Formulario de datos de envío (pantalla completa).
 * Paso 3: Formulario de pago con tarjeta (pantalla completa).
 * Final:  Pantalla de confirmación con resumen de la orden.
 */

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import CartItemRow from './CartItemRow';
import ConfirmDialog from './ConfirmDialog';
import CheckoutStepper from './CheckoutStepper';
import CheckoutEnvioForm from './CheckoutEnvioForm';
import CheckoutPagoForm from './CheckoutPagoForm';
import { useValidacionCarrito } from './hooks/useValidacionCarrito';
import type { PasoCheckout } from './CheckoutStepper';
import type {
  DatosEnvioDto,
  DatosTarjetaDto,
  CheckoutDto,
  CheckoutResponse,
  MetodoPagoResponse,
} from '@/lib/cart-types';
import './CartPageClient.css';

const CartPageClient = () => {
  const { state, subtotalEstimado, vaciar } = useCart();
  const { state: authState } = useAuth();
  const validacion = useValidacionCarrito();
  const router = useRouter();

  const [confirmacionVaciarAbierta, setConfirmacionVaciarAbierta] = useState(false);
  const [paso, setPaso] = useState<PasoCheckout>('carrito');

  // Datos del checkout
  const [datosEnvio, setDatosEnvio] = useState<DatosEnvioDto | null>(null);
  const [envioValido, setEnvioValido] = useState(false);
  const [datosTarjeta, setDatosTarjeta] = useState<DatosTarjetaDto | null>(null);
  const [pagoValido, setPagoValido] = useState(false);

  // Estado del checkout
  const [procesando, setProcesando] = useState(false);
  const [errorCheckout, setErrorCheckout] = useState<string | null>(null);
  const [ordenConfirmada, setOrdenConfirmada] = useState<CheckoutResponse | null>(null);

  // ── Callbacks ────────────────────────────────────────────────────────────

  const handleEnvioChange = useCallback(
    (datos: DatosEnvioDto, esValido: boolean) => {
      setDatosEnvio(datos);
      setEnvioValido(esValido);
    },
    []
  );

  const handlePagoChange = useCallback(
    (datos: DatosTarjetaDto, esValido: boolean) => {
      setDatosTarjeta(datos);
      setPagoValido(esValido);
    },
    []
  );

  const handleConfirmarVaciar = () => {
    vaciar();
    setConfirmacionVaciarAbierta(false);
    setPaso('carrito');
  };

  // ── Checkout ─────────────────────────────────────────────────────────────

  const ejecutarCheckout = async () => {
    if (!datosEnvio || !datosTarjeta || !authState.isAutenticado) return;

    setProcesando(true);
    setErrorCheckout(null);

    try {
      const metodos = await apiFetch<MetodoPagoResponse[]>('/api/cart/payment-methods');
      const tarjetaCredito = metodos.find((m) => m.nombre === 'Tarjeta de crédito');
      if (!tarjetaCredito) throw new Error('No se encontró el método de pago');

      const dto: CheckoutDto = {
        items: state.items.map((i) => ({ itemId: i.itemId, cantidad: i.cantidad })),
        metodoPagoId: tarjetaCredito.id,
        envio: datosEnvio,
        tarjeta: datosTarjeta,
        guardarDatosEnPerfil: true,
      };

      const orden = await apiFetch<CheckoutResponse>('/api/cart/checkout', {
        method: 'POST',
        body: JSON.stringify(dto),
      });

      setOrdenConfirmada(orden);
      vaciar();
      setPaso('confirmacion');
    } catch (err) {
      setErrorCheckout(
        err instanceof Error ? err.message : 'Error inesperado al procesar el pago'
      );
    } finally {
      setProcesando(false);
    }
  };

  // ── Navegación entre pasos ───────────────────────────────────────────────

  const avanzar = () => {
    if (!authState.isAutenticado) {
      router.push('/login?redirect=/carrito');
      return;
    }

    switch (paso) {
      case 'carrito':
        setPaso('envio');
        break;
      case 'envio':
        if (envioValido && datosEnvio) setPaso('pago');
        break;
      case 'pago':
        if (pagoValido && datosTarjeta) ejecutarCheckout();
        break;
    }
  };

  const retroceder = () => {
    setErrorCheckout(null);
    switch (paso) {
      case 'envio':
        setPaso('carrito');
        break;
      case 'pago':
        setPaso('envio');
        break;
    }
  };

  // ── Datos derivados ──────────────────────────────────────────────────────

  const totalAMostrar =
    validacion.tipo === 'ok' ? validacion.data.total : subtotalEstimado;
  const subtotalSinDescuentos =
    validacion.tipo === 'ok'
      ? validacion.data.subtotalSinDescuentos
      : subtotalEstimado;
  const ahorroTotal =
    validacion.tipo === 'ok' ? validacion.data.ahorroTotal : 0;
  const hayAhorro = ahorroTotal > 0;

  const validadosPorId =
    validacion.tipo === 'ok'
      ? new Map(validacion.data.items.map((v) => [v.itemId, v]))
      : null;

  const valoresInicialesEnvio = authState.usuario
    ? {
        nombre: authState.usuario.nombre,
        apellido: authState.usuario.apellido,
        direccion: authState.usuario.direccion ?? '',
        telefono: authState.usuario.telefono ?? '',
      }
    : undefined;

  const textoBoton = (): string => {
    if (!authState.isAutenticado) return 'Iniciar sesión para comprar';
    if (procesando) return 'Procesando...';
    switch (paso) {
      case 'carrito': return 'Confirmar compra';
      case 'envio':   return 'Ir a pagar';
      case 'pago':    return 'Confirmar pago';
      default:        return 'Confirmar compra';
    }
  };

  const botonDeshabilitado = (): boolean => {
    if (procesando) return true;
    if (validacion.tipo === 'ok' && !validacion.data.carritoValido) return true;
    switch (paso) {
      case 'carrito': return false;
      case 'envio':   return !envioValido;
      case 'pago':    return !pagoValido;
      default:        return true;
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (!state.hidratado) {
    return (
      <div className="cart-page">
        <p className="cart-page-loading">Cargando carrito...</p>
      </div>
    );
  }

  // ── PASO: Confirmación ───────────────────────────────────────────────────

  if (paso === 'confirmacion' && ordenConfirmada) {
    return (
      <div className="cart-page">
        <CheckoutStepper pasoActual="confirmacion" />

        <div className="checkout-confirmacion">
          <div className="checkout-confirmacion-icono">✓</div>
          <h1>¡Compra confirmada!</h1>
          <p className="checkout-confirmacion-orden">
            Orden #{ordenConfirmada.ordenId.slice(-8).toUpperCase()}
          </p>
          <p className="checkout-confirmacion-email">
            Te enviamos un email con el detalle de tu compra a tu casilla registrada.
          </p>

          <div className="checkout-confirmacion-card">
            <h2>Resumen del pedido</h2>

            <div className="checkout-confirmacion-seccion">
              <h3>Productos</h3>
              {ordenConfirmada.detalles.map((d) => (
                <div key={d.id} className="checkout-confirmacion-item">
                  <span>{d.nombreItem} × {d.cantidad}</span>
                  <span>${d.monto.toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>

            <div className="checkout-confirmacion-seccion">
              <h3>Envío</h3>
              <p>{ordenConfirmada.envio.nombre} {ordenConfirmada.envio.apellido}</p>
              <p>{ordenConfirmada.envio.direccion}</p>
              <p>Tel: {ordenConfirmada.envio.telefono}</p>
            </div>

            <div className="checkout-confirmacion-seccion">
              <h3>Pago</h3>
              <p>{ordenConfirmada.tarjeta.marca} terminada en ****{ordenConfirmada.tarjeta.ultimos4}</p>
            </div>

            <div className="checkout-confirmacion-total">
              <span>Total pagado</span>
              <strong>${ordenConfirmada.montoTotal.toLocaleString('es-AR')}</strong>
            </div>
          </div>

          <button
            type="button"
            className="checkout-btn-principal"
            onClick={() => router.push('/')}
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  // ── Carrito vacío ────────────────────────────────────────────────────────

  if (state.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-page-empty">
          <h1>Tu carrito está vacío</h1>
          <p>Todavía no agregaste productos. Volvé al inicio para explorar.</p>
          <Link href="/" className="checkout-btn-principal">
            Ir a la tienda
          </Link>
        </div>
      </div>
    );
  }

  // ── PASO 1: Carrito ──────────────────────────────────────────────────────

  if (paso === 'carrito') {
    return (
      <div className="cart-page">
        <CheckoutStepper pasoActual="carrito" />

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

        {validacion.tipo === 'error' && (
          <div className="checkout-banner checkout-banner-error" role="alert">
            <strong>No se pudo validar el carrito.</strong> {validacion.mensaje}
          </div>
        )}

        {validacion.tipo === 'ok' && !validacion.data.carritoValido && (
          <div className="checkout-banner checkout-banner-warning" role="alert">
            Hay items con problemas (sin stock o no disponibles). Revisalos antes de continuar.
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

          <aside className="cart-resumen" aria-label="Resumen">
            <h2>Resumen</h2>
            {hayAhorro && (
              <>
                <div className="cart-resumen-fila cart-resumen-fila-sub">
                  <span>Subtotal</span>
                  <span>${subtotalSinDescuentos.toLocaleString('es-AR')}</span>
                </div>
                <div className="cart-resumen-fila cart-resumen-fila-ahorro">
                  <span>Descuentos por promociones</span>
                  <span>−${ahorroTotal.toLocaleString('es-AR')}</span>
                </div>
              </>
            )}
            <div className="cart-resumen-fila cart-resumen-fila-total">
              <span>Total</span>
              <strong>${totalAMostrar.toLocaleString('es-AR')}</strong>
            </div>

            <button
              type="button"
              className="checkout-btn-principal"
              disabled={botonDeshabilitado()}
              onClick={avanzar}
            >
              {textoBoton()}
            </button>
            <Link href="/" className="checkout-btn-secundario">
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
      </div>
    );
  }

  // ── PASO 2: Datos de envío ───────────────────────────────────────────────

  if (paso === 'envio') {
    return (
      <div className="cart-page">
        <CheckoutStepper pasoActual="envio" />

        <div className="checkout-paso">
          <button type="button" className="checkout-volver" onClick={retroceder}>
            ← Volver al carrito
          </button>

          <div className="checkout-paso-grid">
            <div className="checkout-paso-form">
              <CheckoutEnvioForm
                valoresIniciales={valoresInicialesEnvio}
                onChange={handleEnvioChange}
              />
            </div>

            <aside className="checkout-paso-resumen">
              <h3>Tu pedido</h3>
              {state.items.map((item) => (
                <div key={item.itemId} className="checkout-paso-resumen-item">
                  <span>{item.nombre} × {item.cantidad}</span>
                  <span>${(item.precioUnitario * item.cantidad).toLocaleString('es-AR')}</span>
                </div>
              ))}
              <div className="checkout-paso-resumen-total">
                <span>Total</span>
                <strong>${totalAMostrar.toLocaleString('es-AR')}</strong>
              </div>

              <button
                type="button"
                className="checkout-btn-principal"
                disabled={botonDeshabilitado()}
                onClick={avanzar}
              >
                {textoBoton()}
              </button>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // ── PASO 3: Pago ─────────────────────────────────────────────────────────

  if (paso === 'pago') {
    return (
      <div className="cart-page">
        <CheckoutStepper pasoActual="pago" />

        <div className="checkout-paso">
          <button
            type="button"
            className="checkout-volver"
            onClick={retroceder}
            disabled={procesando}
          >
            ← Volver a datos de envío
          </button>

          {errorCheckout && (
            <div className="checkout-banner checkout-banner-error" role="alert">
              <strong>Error al procesar el pago.</strong> {errorCheckout}
            </div>
          )}

          <div className="checkout-paso-grid">
            <div className="checkout-paso-form">
              <CheckoutPagoForm onChange={handlePagoChange} />
            </div>

            <aside className="checkout-paso-resumen">
              <h3>Tu pedido</h3>
              {state.items.map((item) => (
                <div key={item.itemId} className="checkout-paso-resumen-item">
                  <span>{item.nombre} × {item.cantidad}</span>
                  <span>${(item.precioUnitario * item.cantidad).toLocaleString('es-AR')}</span>
                </div>
              ))}

              {datosEnvio && (
                <div className="checkout-paso-resumen-envio">
                  <span className="checkout-paso-resumen-label">Envío a</span>
                  <span>{datosEnvio.nombre} {datosEnvio.apellido}</span>
                  <span>{datosEnvio.direccion}</span>
                </div>
              )}

              <div className="checkout-paso-resumen-total">
                <span>Total</span>
                <strong>${totalAMostrar.toLocaleString('es-AR')}</strong>
              </div>

              <button
                type="button"
                className="checkout-btn-principal"
                disabled={botonDeshabilitado()}
                onClick={avanzar}
              >
                {textoBoton()}
              </button>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CartPageClient;