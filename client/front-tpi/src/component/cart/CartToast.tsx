'use client';

/**
 * CartToast — confirmación flotante al agregar un producto al carrito.
 */

import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import './CartToast.css';

// Duración del toast visible (en ms).
const DURACION_MS = 4000;

const CartToast = () => {
  const { state, cerrarConfirmacion } = useCart();
  const item = state.ultimoAgregado;
  const visible = item !== null;

  // Auto-cerrar a los DURACION_MS desde que aparece.
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(cerrarConfirmacion, DURACION_MS);
    return () => window.clearTimeout(timer);
  }, [visible, item, cerrarConfirmacion]);

  if (!visible || !item) return null;

  return (
    <div
      className="cart-toast"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="cart-toast-check" aria-hidden="true">
        ✓
      </div>
      <div className="cart-toast-texto">
        <p className="cart-toast-titulo">Agregado al carrito</p>
        <p className="cart-toast-producto">{item.nombre}</p>
      </div>
      <button
        type="button"
        className="cart-toast-cerrar"
        onClick={cerrarConfirmacion}
        aria-label="Cerrar"
      >
        ✕
      </button>
    </div>
  );
};

export default CartToast;