"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import CardProduct from "@/component/layout/card/card";
import { useCart } from "@/context/CartContext";

/** Breakpoint debajo del cual se navega directo a /carrito al agregar. */
const MOBILE_BREAKPOINT = 768;

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
  const { agregar } = useCart();
  const router = useRouter();

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

  const handleAgregar = (product: Product) => {
    agregar({
      itemId: product.id,
      nombre: product.nombre,
      precioUnitario: product.precioUnitario,
      cantidad: 1,
    });

    if (window.innerWidth < MOBILE_BREAKPOINT) {
      router.push("/carrito");
    }
  };

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
                onAddToCart={() => handleAgregar(product)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}