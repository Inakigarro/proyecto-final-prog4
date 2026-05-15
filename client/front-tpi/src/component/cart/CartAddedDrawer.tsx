'use client';

/**
 * Drawer lateral de confirmación al agregar un producto al carrito.
 *
 * Comportamiento:
 *  - Solo visible en desktop (>=768px). En mobile se navega directo a /carrito
 *    desde quien dispara agregar() (ver page.tsx). Si el viewport pasa de
 *    desktop a mobile mientras el drawer está abierto, se cierra solo.
 *  - Se abre cuando el CartContext setea ultimoAgregado.
 *  - Se cierra con: botón X, click en overlay, tecla Escape, o
 *    "Seguir comprando".
 *  - "Ir al carrito" navega a /carrito y cierra el drawer.
 *
 * Montar una sola vez en el RootLayout para que sea global.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import './CartAddedDrawer.css';

const MOBILE_BREAKPOINT = 768;

const CartAddedDrawer = () => {
  const { state, cantidadTotal, cerrarConfirmacion } = useCart();
  const router = useRouter();

  const item = state.ultimoAgregado;
  const abierto = item !== null;

  // Cerrar con Escape y bloquear scroll del body cuando está abierto.
  useEffect(() => {
    if (!abierto) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrarConfirmacion();
    };
    document.addEventListener('keydown', onKeyDown);

    const scrollPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = scrollPrevio;
    };
  }, [abierto, cerrarConfirmacion]);

  // Si el viewport baja a mobile mientras el drawer está abierto, cerrarlo.
  useEffect(() => {
    if (!abierto) return;

    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      if (mq.matches) cerrarConfirmacion();
    };
    if (mq.matches) cerrarConfirmacion();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [abierto, cerrarConfirmacion]);

  if (!abierto || !item) return null;

  const subtotal = parseFloat(
    (item.precioUnitario * item.cantidad).toFixed(2)
  );

  const handleIrAlCarrito = () => {
    cerrarConfirmacion();
    router.push('/carrito');
  };

  return (
    <>
      <div
        className="cart-added-overlay"
        onClick={cerrarConfirmacion}
        aria-hidden="true"
      />

      <aside
        className="cart-added-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-added-title"
      >
        <header className="cart-added-header">
          <div className="cart-added-check" aria-hidden="true">
            ✓
          </div>
          <div className="cart-added-titulo">
            <h2 id="cart-added-title">Agregaste a tu carrito</h2>
            <p className="cart-added-subtitulo">
              {cantidadTotal} {cantidadTotal === 1 ? 'item' : 'items'} en total
            </p>
          </div>
          <button
            type="button"
            className="cart-added-cerrar"
            onClick={cerrarConfirmacion}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        <div className="cart-added-producto">
          <h3 className="cart-added-producto-nombre">{item.nombre}</h3>
          <p className="cart-added-producto-detalle">
            {item.cantidad} {item.cantidad === 1 ? 'unidad' : 'unidades'}
          </p>
          <p className="cart-added-producto-subtotal">
            ${subtotal.toLocaleString('es-AR')}
          </p>
        </div>

        <footer className="cart-added-footer">
          <button
            type="button"
            className="cart-added-cta-primary"
            onClick={handleIrAlCarrito}
            autoFocus
          >
            Ir al carrito
          </button>
          <button
            type="button"
            className="cart-added-cta-secondary"
            onClick={cerrarConfirmacion}
          >
            Seguir comprando
          </button>
        </footer>
      </aside>
    </>
  );
};

export default CartAddedDrawer;