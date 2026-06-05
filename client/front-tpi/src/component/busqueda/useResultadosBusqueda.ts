"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Producto } from "@/lib/productos";

/**
 * Tipo de búsqueda que dispara el listado:
 * - "texto": el usuario tipeó algo en la barra
 * - "categoria": el usuario eligió una categoría del menú
 * - "todos": sin filtros, muestra el catálogo completo
 */
export type TipoBusqueda = "texto" | "categoria" | "todos";

export interface ResultadosBusqueda {
  productos: Producto[];
  cargando: boolean;
  mensajeError: string | null;
  tipoBusqueda: TipoBusqueda;
  /** Texto o nombre de categoría que disparó la búsqueda. Vacío si "todos". */
  termino: string;
}

/**
 * Lee los searchParams (`query` o `categoria`) y trae los productos correspondientes.
 * El backend ya filtra por nombre, descripción y nombre de categoría con el param `q`,
 * así que ambos casos se resuelven con el mismo endpoint.
 */
export const useResultadosBusqueda = (): ResultadosBusqueda => {
  const searchParams = useSearchParams();
  const textoBuscado = searchParams.get("query") ?? "";
  const categoriaSeleccionada = searchParams.get("categoria") ?? "";

  const tipoBusqueda: TipoBusqueda = categoriaSeleccionada
    ? "categoria"
    : textoBuscado
      ? "texto"
      : "todos";
  const termino = categoriaSeleccionada || textoBuscado;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  useEffect(() => {
    const cargarResultados = async () => {
      setCargando(true);
      setMensajeError(null);
      try {
        const url = termino
          ? `/api/products?query=${encodeURIComponent(termino)}`
          : "/api/products";
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error("Error al obtener productos");
        const datos = await respuesta.json();
        setProductos(datos?.products?.datos ?? []);
      } catch (error) {
        setMensajeError(
          error instanceof Error ? error.message : "Error desconocido",
        );
        setProductos([]);
      } finally {
        setCargando(false);
      }
    };
    cargarResultados();
  }, [termino]);

  return { productos, cargando, mensajeError, tipoBusqueda, termino };
};
