'use client';

/**
 * Fila de un item del carrito.
 *
 * Si recibe `validado` (datos del backend), muestra precio y subtotal reales.
 * Si el item está marcado como no disponible, lo muestra atenuado y con motivo.
 * Si no hay validado todavía, usa los datos locales del carrito.
 */

import { useCart } from '@/context/CartContext';
import type { CartItem, ItemValidadoResponse } from '@/lib/cart-types';
import './CartItemRow.css';

interface CartItemRowProps {
  item: CartItem;
  /** Datos validados del backend. null mientras no llegan. */
  validado: ItemValidadoResponse | null;
}

const CartItemRow = ({ item, validado }: CartItemRowProps) => {
  const { actualizarCantidad, quitar } = useCart();

  // Precio y subtotal: prioridad al backend cuando hay validación.
  const precioUnitario = validado?.precioUnitario ?? item.precioUnitario;
  const subtotal =
    validado?.subtotal ??
    parseFloat((item.precioUnitario * item.cantidad).toFixed(2));

  // ¿El item tiene problema? (sin stock, no existe, etc.)
  const hayProblema = validado !== null && !validado.disponible;

  // ¿Cambió el precio respecto al snapshoteado al agregar?
  const precioCambio =
    validado !== null && validado.precioUnitario !== item.precioUnitario;

  return (
    <div className={`cart-row ${hayProblema ? 'cart-row-problema' : ''}`}>
      <div className="cart-row-info">
        <h3 className="cart-row-nombre">{item.nombre}</h3>

        <p className="cart-row-precio-unitario">
          ${precioUnitario.toLocaleString('es-AR')} c/u
          {precioCambio && (
            <span className="cart-row-precio-aviso">
              {' '}
              (precio actualizado)
            </span>
          )}
        </p>

        {hayProblema && validado.motivo && (
          <p className="cart-row-motivo">{validado.motivo}</p>
        )}
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