import React from "react";
import "./card.css";

type CardProductProps = {
  imageSrc?: string;
  title?: string;
  description?: string;
  price?: string;
  onAddToCart?: () => void;
};

const CardProduct = ({
  imageSrc = "https://via.placeholder.com/300x202.png?text=Producto",
  title = "Nombre del producto",
  description = "Breve descripción del producto para destacar sus características principales.",
  price = "$12.999",
  onAddToCart,
}: CardProductProps) => {
  return (
    <article className="card-product">
      <div className="card-image-wrapper">
        <img className="card-image" src={imageSrc} alt={title} />
      </div>
      <div className="card-details">
        <div className="card-divider" />
        <div className="card-info">
          <span className="card-price">{price}</span>
          <h3 className="card-title">{title}</h3>
          <p className="card-description">{description}</p>
        </div>
        <button
          type="button"
          className="card-cta"
          onClick={onAddToCart}
        >
          Agregar al carrito
        </button>
      </div>
    </article>
  );
};

export default CardProduct;
