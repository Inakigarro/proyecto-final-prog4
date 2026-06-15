"use client";

import { useEffect, useState } from "react";

export interface Categoria {
  id: string;
  nombre: string;
}

interface RespuestaProductos {
  products?: {
    datos?: Array<{
      category?: Categoria[];
    }>;
  };
}

interface EstadoCategorias {
  categorias: Categoria[];
  cargando: boolean;
}

/** Trae categorías derivándolas de la respuesta de productos, dedupadas por id y ordenadas alfabéticamente */
export const useCategorias = (): EstadoCategorias => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const respuesta = await fetch("/api/products");
        if (!respuesta.ok) return;
        const datos: RespuestaProductos = await respuesta.json();
        const productos = datos?.products?.datos ?? [];
        const mapa = new Map<string, Categoria>();
        for (const producto of productos) {
          for (const categoria of producto.category ?? []) {
            if (categoria?.id && !mapa.has(categoria.id)) {
              mapa.set(categoria.id, {
                id: categoria.id,
                nombre: categoria.nombre,
              });
            }
          }
        }
        const ordenadas = Array.from(mapa.values()).sort((a, b) =>
          a.nombre.localeCompare(b.nombre),
        );
        setCategorias(ordenadas);
      } catch {
        // Falla silenciosa: el menú queda vacío
      } finally {
        setCargando(false);
      }
    };
    cargarCategorias();
  }, []);

  return { categorias, cargando };
};

/** Construye la URL de búsqueda filtrada por nombre de categoría */
export const urlBusquedaPorCategoria = (nombreCategoria: string): string =>
  `/search-result?categoria=${encodeURIComponent(nombreCategoria)}`;
