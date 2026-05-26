"use client";

import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type Props = {
  product: Product;
  onAddToCart: (product: Product) => void;
};

export default function ProductCard({
  product,
  onAddToCart,
}: Props) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/products/${product.id}`);
  };

  const handleAddToCart = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div
      onClick={handleNavigate}
      style={{
        cursor: "pointer",
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <img
        src={product.image}
        alt={product.name}
        style={{ width: "100%" }}
      />

      <h3>{product.name}</h3>

      <p>${product.price}</p>

      <button onClick={handleAddToCart}>
        Agregar al carrito
      </button>
    </div>
  );
}