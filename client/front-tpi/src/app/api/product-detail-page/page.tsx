'use client';

import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  specs: string[];
  stock: number;
  price: number;
  image?: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/products/${id}`
        );

        const data = await response.json();

        setProduct(data);
      } catch (error) {
        console.error("Error obteniendo producto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <p>Cargando producto...</p>;
  }

  if (!product) {
    return <p>Producto no encontrado</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>{product.name}</h1>

      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          width={300}
        />
      )}

      <h2>Descripción</h2>
      <p>{product.description}</p>

      <h2>Especificaciones</h2>
      <ul>
        {product.specs.map((spec, index) => (
          <li key={index}>{spec}</li>
        ))}
      </ul>

      <h2>Stock</h2>
      <p>{product.stock} unidades disponibles</p>

      <h2>Precio</h2>
      <p>${product.price}</p>
    </div>
  );
}