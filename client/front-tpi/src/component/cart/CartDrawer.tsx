'use client';

/**
 * CartDrawer — mini-cart lateral.
 *
 * Se abre cuando state.drawerAbierto === true (disparado desde CartIcon).
 * Mientras está abierto, valida los items contra el backend a través del
 * hook compartido `useValidacionCarrito` (que lee/escribe en el slice de
 * Redux). Cuando está cerrado, no dispara validaciones.
 *
 * Al hacer click en "Finalizar compra" verifica si el usuario está autenticado;
 * si no lo está, redirige a /login?redirect=/carrito. Si lo está, navega a /carrito.
 *
 * Se cierra con: botón X, click en overlay, tecla Escape o "Seguir comprando".
 *
 * Montar una sola vez en el RootLayout.
 */

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import CartItemRow from './CartItemRow';
import { useValidacionCarrito } from './useValidacionCarrito';
import './CartDrawer.css';

const CartDrawer = () => {
  const { state, cantidadTotal, subtotalEstimado, cerrarDrawer, vaciar } =
    useCart();
  const { state: authState } = useAuth();
  const router = useRouter();

  const abierto = state.drawerAbierto;
  const items = state.items;

  // Solo validar mientras el drawer esté abierto: evita requests innecesarias
  // cuando el mini-cart no está visible.
  const validacion = useValidacionCarrito({ habilitado: abierto });

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

  // Mapa itemId -> ItemValidado para enriquecer cada row con datos del backend
  const validadosPorId = useMemo(() => {
    if (validacion.tipo !== 'ok') return null;
    return new Map(validacion.data.items.map((v) => [v.itemId, v]));
  }, [validacion]);

  // Totales: prioridad al backend (con promos aplicadas), fallback al local
  const totalAMostrar =
    validacion.tipo === 'ok' ? validacion.data.total : subtotalEstimado;
  const ahorroTotal =
    validacion.tipo === 'ok' ? validacion.data.ahorroTotal : 0;
  const hayAhorro = ahorroTotal > 0;
  const validando = validacion.tipo === 'cargando';
  const errorValidacion =
    validacion.tipo === 'error' ? validacion.mensaje : null;

  const hayItems = items.length > 0;

  const handleFinalizar = () => {
    cerrarDrawer();
    if (authState.isAutenticado) {
      router.push('/carrito');
    } else {
      router.push('/login?redirect=/carrito');
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
                <>
                  {validando && (
                    <p className="cart-drawer-status">Verificando stock...</p>
                  )}
                  {errorValidacion && (
                    <p className="cart-drawer-status cart-drawer-status-error">
                      No pudimos verificar el stock: {errorValidacion}
                    </p>
                  )}

                  <div className="cart-drawer-items">
                    {items.map((item) => (
                      <CartItemRow
                        key={item.itemId}
                        item={item}
                        validado={validadosPorId?.get(item.itemId) ?? null}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {hayItems && (
              <footer className="cart-drawer-footer">
                {hayAhorro && (
                  <div className="cart-drawer-ahorro">
                    <span>Descuentos aplicados</span>
                    <span>−${ahorroTotal.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="cart-drawer-total">
                  <span>Total</span>
                  <span className="cart-drawer-total-monto">
                    ${totalAMostrar.toLocaleString('es-AR')}
                  </span>
                </div>
                <button
                  type="button"
                  className="cart-drawer-cta-primario"
                  onClick={handleFinalizar}
                  disabled={
                    validacion.tipo === 'ok' && !validacion.data.carritoValido
                  }
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

    </>
  );
};

export default CartDrawer;
