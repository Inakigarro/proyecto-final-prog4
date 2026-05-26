'use client';

/**
 * CartDrawer — mini-cart lateral.
 *
 * Se abre cuando state.drawerAbierto === true (disparado desde CartIcon).
 * Al abrirse, dispara la validación contra POST /api/cart/validate para
 * mostrar info real de stock y precio.
 *
 * Se cierra con: botón X, click en overlay, tecla Escape, "Seguir comprando",
 * o al navegar a /carrito desde "Finalizar compra".
 *
 * Montar una sola vez en el RootLayout.
 */

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import CartItemRow from './CartItemRow';
import type {
  ItemValidadoResponse,
  ValidarCarritoDto,
  ValidacionCarritoResponse,
} from '@/lib/cart-types';
import './CartDrawer.css';

const CartDrawer = () => {
  const { state, cantidadTotal, subtotalEstimado, cerrarDrawer, vaciar } =
    useCart();
  const router = useRouter();

  const abierto = state.drawerAbierto;
  const items = state.items;

  // Validación contra el backend.
  const [validando, setValidando] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [validacion, setValidacion] = useState<ValidacionCarritoResponse | null>(
    null
  );

  // Mapa itemId → ItemValidadoResponse para pasar a cada row.
  const mapaValidados = useMemo(() => {
    const m = new Map<string, ItemValidadoResponse>();
    validacion?.items.forEach((v) => m.set(v.itemId, v));
    return m;
  }, [validacion]);

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

  // Validar contra el backend cuando se abre o cuando cambian los items.
  useEffect(() => {
    if (!abierto || items.length === 0) {
      setValidacion(null);
      setErrorValidacion(null);
      return;
    }

    const controller = new AbortController();

    const validar = async () => {
      setValidando(true);
      setErrorValidacion(null);
      try {
        const body: ValidarCarritoDto = {
          items: items.map((i) => ({ itemId: i.itemId, cantidad: i.cantidad })),
        };
        const res = await fetch('/api/cart/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`Error ${res.status} al validar carrito`);
        }
        const data = (await res.json()) as ValidacionCarritoResponse;
        setValidacion(data);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setErrorValidacion(
          err instanceof Error ? err.message : 'Error desconocido'
        );
      } finally {
        setValidando(false);
      }
    };

    validar();
    return () => controller.abort();
  }, [abierto, items]);

  if (!abierto) return null;

  // Total a mostrar: prefiere el validado del backend, fallback al estimado local.
  const totalMostrado = validacion?.total ?? subtotalEstimado;
  const hayItems = items.length > 0;

  const handleFinalizar = () => {
    cerrarDrawer();
    // En el Paso 3 esto pasa por el LoginGate. Por ahora navegamos directo.
    router.push('/carrito');
  };

  return (
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
                    validado={mapaValidados.get(item.itemId) ?? null}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {hayItems && (
          <footer className="cart-drawer-footer">
            <div className="cart-drawer-total">
              <span>Subtotal</span>
              <span className="cart-drawer-total-monto">
                ${totalMostrado.toLocaleString('es-AR')}
              </span>
            </div>
            <button
              type="button"
              className="cart-drawer-cta-primario"
              onClick={handleFinalizar}
              disabled={validacion?.carritoValido === false}
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
  );
};

export default CartDrawer;