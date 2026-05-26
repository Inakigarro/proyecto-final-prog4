'use client';

/**
 * Icono del carrito con badge de cantidad.
 *
 * Pensado para vivir dentro del navbar pero sin acoplarse a su diseño:
 * trae sus propios estilos en CartIcon.css. El navbar solo lo importa
 * y lo monta donde corresponda.
 *
 * El click navega a /carrito (página completa del carrito, Paso 5).
 * En el Paso 4 se podría extender para abrir un drawer lateral en lugar
 * de navegar — la decisión queda concentrada en este componente.
 */

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import './CartIcon.css';

const CartIcon = () => {
  const { cantidadTotal } = useCart();

  // Texto accesible legible: "Carrito (3 items)" o "Carrito vacío".
  const ariaLabel =
    cantidadTotal === 0
      ? 'Carrito vacío'
      : `Carrito (${cantidadTotal} ${cantidadTotal === 1 ? 'item' : 'items'})`;

  return (
    <Link href="/carrito" className="cart-icon" aria-label={ariaLabel}>
      <span className="cart-icon-emoji" aria-hidden="true">
        🛒
      </span>
      {cantidadTotal > 0 && (
        <span className="cart-icon-badge" aria-hidden="true">
          {cantidadTotal > 99 ? '99+' : cantidadTotal}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;