"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import CardProduct from "@/component/card/card";

type Categoria = {
  id: string;
  nombre: string;
  items: string[];
};

type Producto = {
  id: string;
  nombre: string;
  precioUnitario: number;
  descripcion?: string;
  imageSrc?: string;
  /** Texto promocional que la API enviará en el futuro (ej. "Cuotas sin interés"). */
  cucarda?: string;
  category: Categoria[];
};

export default function PageListProduct() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = query
          ? `/api/products?query=${encodeURIComponent(query)}`
          : "/api/products";
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error al obtener productos");
        const data = await res.json();
        setProducts(data.products.datos ?? []);
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
          <h2>
            {query ? `Resultados para: "${query}"` : "Todos los productos"}
          </h2>

          {products.length === 0 ? (
            <p className={styles.sinResultados}>
              No se encontraron productos.
            </p>
          ) : (
            <div className={styles.productList}>
              {products.map((product) => (
                <CardProduct
                  key={product.id}
                  itemId={product.id}
                  title={product.nombre}
                  precioUnitario={product.precioUnitario}
                  imageSrc={product.imageSrc}
                  categoria={product.category[0]?.nombre}
                  cucarda={product.cucarda}
                  description={product.descripcion ?? ""}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
