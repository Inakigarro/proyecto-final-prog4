'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import CartItemRow from './CartItemRow';
import './CartPageClient.css';

const CartPageClient = () => {
  const { state, subtotalEstimado, vaciar } = useCart();

  // Mientras no hidratamos desde localStorage, mostramos un placeholder.
  if (!state.hidratado) {
    return (
      <div className="cart-page">
        <p className="cart-page-loading">Cargando carrito...</p>
      </div>
    );
  }

  // Estado vacío.
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

  // Estado con items.
  return (
    <div className="cart-page">
      <header className="cart-page-header">
        <h1>Mi carrito</h1>
        <button
          type="button"
          className="cart-page-vaciar"
          onClick={() => {
            // Confirmación nativa, suficiente para esta etapa.
            if (window.confirm('¿Vaciar todo el carrito?')) {
              vaciar();
            }
          }}
        >
          Vaciar carrito
        </button>
      </header>

      <div className="cart-page-grid">
        <section className="cart-page-items" aria-label="Items del carrito">
          {state.items.map((item) => (
            <CartItemRow key={item.itemId} item={item} />
          ))}
        </section>

        <aside className="cart-page-resumen" aria-label="Resumen de la compra">
          <h2>Resumen</h2>

          <div className="cart-page-resumen-fila">
            <span>Subtotal</span>
            <strong>${subtotalEstimado.toLocaleString('es-AR')}</strong>
          </div>

          <p className="cart-page-resumen-nota">
            El total final se confirma al finalizar la compra. Stock y precios
            se validan contra el sistema antes del pago.
          </p>

          <button
            type="button"
            className="cart-page-cta-primary"
            disabled
            title="Disponible en el próximo paso"
          >
            Confirmar compra
          </button>

          <Link href="/" className="cart-page-cta-secondary">
            Seguir comprando
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default CartPageClient;