"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

export default function PageListProduct() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = query ? `/api/products?query=${encodeURIComponent(query)}` : "/api/products";
        const res = await fetch(url);
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
  }, [query]);

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
        <div className={styles.containerPrincipal}>
          <h2>{query ? `Resultados para: "${query}"` : "Todos los productos"}</h2>
          <div className={styles.productList}>
            {products.map((product) => (
              <CardProduct
                key={product.id}
                title={product.nombre}
                price={`$${product.precioUnitario}`}
                description={`Categoría: ${product.category.map((cat) => cat.nombre).join(", ")}`}
                onAddToCart={() =>
                  alert(`Agregado al carrito: ${product.nombre}`)
                }
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
