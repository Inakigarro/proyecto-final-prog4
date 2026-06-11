'use client';

/**
 * Fila de un item del carrito.
 *
 * Layout vertical de 2 zonas (info arriba + controles/subtotal abajo) separado
 * por un divisor. Se adapta naturalmente al ancho del contenedor — funciona
 * igual de bien en el mini-cart drawer (≤420px) y en la página completa.
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

  // Precio base unitario: prioridad al backend cuando hay validación
  const precioUnitarioBase = validado?.precioUnitario ?? item.precioUnitario;
  // Precio unitario con descuento (solo se llena para DESCUENTO_PORCENTUAL)
  const precioUnitarioConDescuento = validado?.precioUnitarioConDescuento;
  // Subtotal final post-promoción
  const subtotal =
    validado?.subtotal ??
    parseFloat((item.precioUnitario * item.cantidad).toFixed(2));
  const ahorroTotal = validado?.ahorroTotal ?? 0;
  const promocionAplicada = validado?.promocionAplicada;

  const hayProblema = validado !== null && !validado.disponible;
  const precioCambio =
    validado !== null && validado.precioUnitario !== item.precioUnitario;

  const formatear = (valor: number) => `$${valor.toLocaleString('es-AR')}`;

  return (
    <article className={`cart-row${hayProblema ? ' cart-row-problema' : ''}`}>
      <div className="cart-row-main">
        <div className="cart-row-info">
          <h3 className="cart-row-nombre">{item.nombre}</h3>

          {/* Precio unitario: tachado + nuevo en una línea con wrap controlado */}
          <p className="cart-row-precio-linea">
            {precioUnitarioConDescuento !== undefined && (
              <span className="cart-row-precio-tachado">
                {formatear(precioUnitarioBase)}
              </span>
            )}
            <span className="cart-row-precio-actual">
              {formatear(precioUnitarioConDescuento ?? precioUnitarioBase)} c/u
            </span>
          </p>

          {/* Badge + nombre de la promoción aplicada */}
          {promocionAplicada && (
            <div className="cart-row-promo">
              <span className="cart-row-promo-badge">
                {promocionAplicada.etiqueta}
              </span>
              <span className="cart-row-promo-nombre">
                {promocionAplicada.nombrePromocion}
              </span>
            </div>
          )}

          {precioCambio && (
            <p className="cart-row-aviso">Precio actualizado</p>
          )}

          {hayProblema && validado.motivo && (
            <p className="cart-row-motivo">{validado.motivo}</p>
          )}
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

      <div className="cart-row-footer">
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

        <div className="cart-row-subtotal-bloque">
          <span className="cart-row-subtotal">{formatear(subtotal)}</span>
          {ahorroTotal > 0 && (
            <span className="cart-row-ahorro">
              Ahorrás {formatear(ahorroTotal)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default CartItemRow;
