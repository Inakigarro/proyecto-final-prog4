"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/lib/cart-types";
import {
  calcularDescuentoItem,
  describirPromocion,
  type Promocion,
} from "@/lib/promociones";
import "./card.css";

// Breakpoint a partir del cual el drawer lateral reemplaza la navegación directa.
const MOBILE_BREAKPOINT = 768;

export type CardProductProps = {
  /** ID único del producto — se usa como itemId en el carrito. */
  itemId: string;
  /** URL de la imagen principal. */
  imageSrc?: string;
  /** Etiqueta de categoría mostrada en la esquina superior izquierda de la imagen. */
  categoria?: string;
  /**
   * Cucarda promocional fallback en la esquina inferior izquierda de la imagen.
   * Solo se usa si NO se pasa `promocion`. Útil para texto libre tipo "Cuotas sin interés".
   */
  cucarda?: string;
  /**
   * Promoción aplicable al producto. Si se pasa, la card deriva la cucarda
   * y, si es DESCUENTO_PORCENTUAL, pinta el precio tachado + nuevo.
   */
  promocion?: Promocion;
  /** Título principal del producto. */
  title: string;
  /** Descripción breve, se trunca a 2 líneas. */
  description?: string;
  /** Precio unitario en pesos — se formatea en pantalla. */
  precioUnitario: number;
};

const CardProduct = ({
  itemId,
  imageSrc = "https://placehold.co/400x220?text=Sin+imagen",
  categoria,
  cucarda,
  promocion,
  title,
  description,
  precioUnitario,
}: CardProductProps) => {
  const { agregar } = useCart();
  const router = useRouter();

  // Si hay promoción, deriva cucarda y, para PORCENTUAL, calcula precio con desc.
  // El fallback `cucarda` (texto libre) solo se usa cuando no llega promo.
  const cucardaMostrada = promocion ? describirPromocion(promocion) : cucarda;
  const calculoDescuento = promocion
    ? calcularDescuentoItem(precioUnitario, 1, promocion)
    : undefined;
  const precioConDescuento = calculoDescuento?.precioUnitarioConDescuento;
  const hayPrecioTachado = precioConDescuento !== undefined;

  /** Agrega el producto al carrito y maneja la UI post-agregado. */
  const handleAgregarAlCarrito = () => {
    const item: CartItem = {
      itemId,
      nombre: title,
      // Snapshot del precio BASE (sin descuento): el backend aplica la promo
      // en /api/cart/validate. Guardar el precio con desc localmente generaría
      // doble descuento.
      precioUnitario,
      cantidad: 1,
    };
    agregar(item);

    if (window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches) {
      router.push("/carrito");
    }
  };

  /** Navega al PDP del producto. */
  const handleNavegar = () => {
    router.push(`/product-detail-page/${itemId}`);
  };

  return (
    <article className="card-product">
      {/* Imagen con overlays de categoría y cucarda — clickeable al PDP */}
      <div className="card-image-wrapper" onClick={handleNavegar} style={{ cursor: "pointer" }}>
        <img className="card-image" src={imageSrc} alt={title} />

        {/* Badge de categoría — top left */}
        {categoria && (
          <span className="card-badge">{categoria.toUpperCase()}</span>
        )}

        {/* Cucarda promocional — bottom left */}
        {cucardaMostrada && (
          <span className="card-cucarda">{cucardaMostrada}</span>
        )}
      </div>

      {/* Cuerpo de la card */}
      <div className="card-details">
        {/* Título clickeable al PDP */}
        <h3 className="card-title" onClick={handleNavegar} style={{ cursor: "pointer" }}>{title}</h3>

        {description && <p className="card-description">{description}</p>}

        {/* Footer: precio + CTA */}
        <div className="card-footer">
          <div className="card-precio-bloque">
            {hayPrecioTachado ? (
              <>
                <span className="card-precio-tachado">
                  ${precioUnitario.toLocaleString("es-AR")}
                </span>
                <span className="card-precio card-precio-descuento">
                  ${precioConDescuento.toLocaleString("es-AR")}
                </span>
              </>
            ) : (
              <span className="card-precio">
                ${precioUnitario.toLocaleString("es-AR")}
              </span>
            )}
          </div>

          <button
            type="button"
            className="card-cta"
            onClick={handleAgregarAlCarrito}
            aria-label={`Agregar ${title} al carrito`}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </article>
  );
};

export default CardProduct;
