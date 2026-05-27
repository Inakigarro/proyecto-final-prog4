"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Producto } from "../types";

/**
 * Forma del response de GET /api/products (Next.js API route).
 * El route handler envuelve la respuesta paginada del backend bajo `products`.
 */
interface ProductosResponse {
  products: {
    datos: Producto[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

/**
 * Obtiene los productos relacionados al producto actual.
 *
 * "Relacionado" significa que comparte al menos una categoría con el producto
 * recibido. El producto actual queda excluido del resultado.
 *
 * Un fallo en este fetch no propaga error: los relacionados son opcionales
 * y no deben bloquear la renderización de la PDP.
 *
 * @param producto - Producto de referencia. Si es `null`, devuelve lista vacía.
 * @returns Lista de productos relacionados (puede ser vacía).
 */
export function useRelacionados(producto: Producto | null): Producto[] {
  const [relacionados, setRelacionados] = useState<Producto[]>([]);

  useEffect(() => {
    if (!producto) return;

    let cancelado = false;

    const cargar = async () => {
      try {
        const data = await apiFetch<ProductosResponse>("/api/products");
        if (cancelado) return;

        const todos = data.products?.datos ?? [];
        const categoriasActuales = producto.category.map((c) => c.id);

        setRelacionados(
          todos.filter(
            (p) =>
              p.id !== producto.id &&
              p.category.some((c) => categoriasActuales.includes(c.id))
          )
        );
      } catch {
        // Silenciamos: los relacionados son un "nice to have".
      }
    };

    cargar();

    return () => { cancelado = true; };
  }, [producto]);

  return relacionados;
}
