'use client';

/**
 * Icono del carrito con badge de cantidad.
 *
 * Vive en el navbar pero sin acoplarse a su diseño: trae sus propios estilos
 * en CartIcon.css. El click abre el CartDrawer lateral; la navegación a la
 * página completa /carrito ocurre desde el drawer (botón "Finalizar compra").
 */

import { useCart } from '@/context/CartContext';
import './CartIcon.css';

const CartIcon = () => {
  const { cantidadTotal, abrirDrawer } = useCart();

  // Texto accesible legible: "Carrito (3 items)" o "Carrito vacío".
  const ariaLabel =
    cantidadTotal === 0
      ? 'Carrito vacío'
      : `Carrito (${cantidadTotal} ${cantidadTotal === 1 ? 'item' : 'items'})`;

  return (
    <button
      type="button"
      onClick={abrirDrawer}
      className="cart-icon"
      aria-label={ariaLabel}
    >
      <span className="cart-icon-emoji" aria-hidden="true">
        🛒
      </span>
      {cantidadTotal > 0 && (
        <span className="cart-icon-badge" aria-hidden="true">
          {cantidadTotal > 99 ? '99+' : cantidadTotal}
        </span>
      )}
    </button>
  );
};

export default CartIcon;