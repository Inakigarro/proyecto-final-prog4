'use client';

/**
 * Fila de un item del carrito.
 *
 * Muestra los datos del item con controles para cambiar cantidad y eliminar.
 * Toda la lógica de mutación delega en el CartContext: este componente solo
 * presenta y dispara las acciones.
 */

import { useCart } from '@/context/CartContext';
import type { CartItem } from '@/lib/cart-types';
import './CartItemRow.css';

interface CartItemRowProps {
  item: CartItem;
}

const CartItemRow = ({ item }: CartItemRowProps) => {
  const { actualizarCantidad, quitar } = useCart();

  const subtotal = parseFloat(
    (item.precioUnitario * item.cantidad).toFixed(2)
  );

  return (
    <div className="cart-row">
      <div className="cart-row-info">
        <h3 className="cart-row-nombre">{item.nombre}</h3>
        <p className="cart-row-precio-unitario">
          ${item.precioUnitario.toLocaleString('es-AR')} c/u
        </p>
      </div>

      <div className="cart-row-controles">
        <button
          type="button"
          className="cart-qty-btn"
          onClick={() => actualizarCantidad(item.itemId, item.cantidad - 1)}
          aria-label={`Disminuir cantidad de ${item.nombre}`}
        >
          −
        </button>
        <span className="cart-qty-value" aria-live="polite">
          {item.cantidad}
        </span>
        <button
          type="button"
          className="cart-qty-btn"
          onClick={() => actualizarCantidad(item.itemId, item.cantidad + 1)}
          aria-label={`Aumentar cantidad de ${item.nombre}`}
        >
          +
        </button>
      </div>

      <div className="cart-row-subtotal">
        ${subtotal.toLocaleString('es-AR')}
      </div>

      <button
        type="button"
        className="cart-row-eliminar"
        onClick={() => quitar(item.itemId)}
        aria-label={`Eliminar ${item.nombre} del carrito`}
      >
        ✕
      </button>
    </div>
  );
};

export default CartItemRow;