"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import CardProduct from "@/component/layout/card/card";

type Product = {
  id: string;
  nombre: string;
  precioUnitario: number;
  category: Array<{
    id: string;
    nombre: string;
    items: string[];
  }>;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) {
          throw new Error("Error al obtener productos");
        }
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <h1>Cargando productos...</h1>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <h1>Error: {error}</h1>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Bienvenido a nuestra tienda</h1>
        <div className={styles.containerPrincipal}>
          <div className={styles.productList}>
            {products.map((product) => (
              <CardProduct
                key={product.id}
                title={product.nombre}
                price={`$${product.precioUnitario}`}
                description={`Categoría: ${product.category.map(cat => cat.nombre).join(", ")}`}
                onAddToCart={() => alert(`Agregado al carrito: ${product.nombre}`)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
