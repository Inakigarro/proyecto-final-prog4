"use client";

import { useEffect, useState } from "react";

export interface Categoria {
  id: string;
  nombre: string;
}

/**
 * Forma que devuelve GET /api/categories.
 * Cada categoría incluye su cantidad de items para que podamos descartar las
 * que estén vacías sin tener que pedir el detalle.
 */
interface CategoriaApi {
  id: string;
  nombre: string;
  cantidadItems: number;
}

interface EstadoCategorias {
  categorias: Categoria[];
  cargando: boolean;
}

/**
 * Trae las categorías directamente desde el endpoint dedicado del backend.
 *
 * Antes este hook derivaba las categorías de los productos devueltos por
 * `/api/products`, pero como esa respuesta está paginada (20 productos por
 * página), solo aparecían las categorías que tuvieran al menos un producto
 * en la primera página. Ahora pegamos directo contra `/api/categories` que
 * lista todas las activas y devolvemos las que tienen al menos un item.
 */
export const useCategorias = (): EstadoCategorias => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const respuesta = await fetch("/api/categories");
        if (!respuesta.ok) return;
        const datos: CategoriaApi[] = await respuesta.json();
        const ordenadas = datos
          .filter((c) => c.cantidadItems > 0)
          .map<Categoria>((c) => ({ id: c.id, nombre: c.nombre }))
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
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
