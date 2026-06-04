'use client';

/**
 * CartDrawer — mini-cart lateral.
 *
 * Se abre cuando state.drawerAbierto === true (disparado desde CartIcon).
 * Al hacer click en "Finalizar compra" verifica si el usuario está autenticado;
 * si no lo está, abre el LoginGateModal.
 *
 * Se cierra con: botón X, click en overlay, tecla Escape, "Seguir comprando",
 * o al abrir el LoginGateModal desde "Finalizar compra".
 *
 * Montar una sola vez en el RootLayout.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import CartItemRow from './CartItemRow';
import LoginGateModal from './LoginGateModal';
import './CartDrawer.css';

const CartDrawer = () => {
  const { state, cantidadTotal, subtotalEstimado, cerrarDrawer, vaciar } =
    useCart();
  const { state: authState } = useAuth();
  const router = useRouter();

  const abierto = state.drawerAbierto;
  const items = state.items;

  const [loginAbierto, setLoginAbierto] = useState(false);

  // Cerrar con Escape + bloquear scroll del body mientras está abierto.
  useEffect(() => {
    if (!abierto) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrarDrawer();
    };
    document.addEventListener('keydown', onKeyDown);

    const scrollPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = scrollPrevio;
    };
  }, [abierto, cerrarDrawer]);

  const hayItems = items.length > 0;

  const handleFinalizar = () => {
    cerrarDrawer();
    if (authState.isAutenticado) {
      router.push('/carrito');
    } else {
      setLoginAbierto(true);
    }
  };

  return (
    <>
      {abierto && (
        <>
          <div
            className="cart-drawer-overlay"
            onClick={cerrarDrawer}
            aria-hidden="true"
          />

          <aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
          >
            <header className="cart-drawer-header">
              <h2 id="cart-drawer-title" className="cart-drawer-titulo">
                Tu carrito
                {cantidadTotal > 0 && (
                  <span className="cart-drawer-contador"> ({cantidadTotal})</span>
                )}
              </h2>
              <button
                type="button"
                className="cart-drawer-cerrar"
                onClick={cerrarDrawer}
                aria-label="Cerrar carrito"
              >
                ✕
              </button>
            </header>

            <div className="cart-drawer-body">
              {!hayItems && (
                <div className="cart-drawer-vacio">
                  <p className="cart-drawer-vacio-titulo">Tu carrito está vacío</p>
                  <p className="cart-drawer-vacio-subtitulo">
                    Agregá productos para verlos acá.
                  </p>
                  <button
                    type="button"
                    className="cart-drawer-cta-secundario"
                    onClick={cerrarDrawer}
                  >
                    Seguir comprando
                  </button>
                </div>
              )}

              {hayItems && (
                <div className="cart-drawer-items">
                  {items.map((item) => (
                    <CartItemRow
                      key={item.itemId}
                      item={item}
                      validado={null}
                    />
                  ))}
                </div>
              )}
            </div>

            {hayItems && (
              <footer className="cart-drawer-footer">
                <div className="cart-drawer-total">
                  <span>Subtotal</span>
                  <span className="cart-drawer-total-monto">
                    ${subtotalEstimado.toLocaleString('es-AR')}
                  </span>
                </div>
                <button
                  type="button"
                  className="cart-drawer-cta-primario"
                  onClick={handleFinalizar}
                >
                  Finalizar compra
                </button>
                <button
                  type="button"
                  className="cart-drawer-cta-vaciar"
                  onClick={vaciar}
                >
                  Vaciar carrito
                </button>
              </footer>
            )}
          </aside>
        </>
      )}

      <LoginGateModal
        abierto={loginAbierto}
        onCerrar={() => setLoginAbierto(false)}
        onLoginExitoso={() => router.push('/carrito')}
      />
    </>
  );
};

export default CartDrawer;