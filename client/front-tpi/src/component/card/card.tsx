"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/lib/cart-types";
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
  /** Cucarda promocional en la esquina inferior izquierda de la imagen (ej. "Cuotas sin interés"). */
  cucarda?: string;
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
  title,
  description,
  precioUnitario,
}: CardProductProps) => {
  const { agregar } = useCart();
  const router = useRouter();

  /** Agrega el producto al carrito y maneja la UI post-agregado:
   *  - Mobile: navega directo a /carrito.
   *  - Desktop: el CartAddedDrawer (montado en el layout) muestra la confirmación.
   */
  const handleAgregarAlCarrito = () => {
    const item: CartItem = {
      itemId,
      nombre: title,
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
        {cucarda && (
          <span className="card-cucarda">{cucarda}</span>
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
            <span className="card-precio">
              ${precioUnitario.toLocaleString("es-AR")}
            </span>
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
