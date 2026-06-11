"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Producto } from "@/lib/productos";
import type { Promocion } from "@/lib/promociones";

/**
 * Tipo de búsqueda que dispara el listado:
 * - "texto": el usuario tipeó algo en la barra
 * - "categoria": el usuario eligió una categoría del menú
 * - "todos": sin filtros, muestra el catálogo completo
 */
export type TipoBusqueda = "texto" | "categoria" | "todos";

export interface ResultadosBusqueda {
  productos: Producto[];
  /** Promociones activas vigentes — se usan para pintar cucardas en las cards. */
  promociones: Promocion[];
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
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  useEffect(() => {
    const cargarResultados = async () => {
      setCargando(true);
      setMensajeError(null);
      try {
        const urlProductos = termino
          ? `/api/products?query=${encodeURIComponent(termino)}`
          : "/api/products";

        // Productos y promociones se piden en paralelo: son independientes
        const [respuestaProductos, respuestaPromociones] = await Promise.all([
          fetch(urlProductos),
          fetch("/api/promotions"),
        ]);

        if (!respuestaProductos.ok) {
          throw new Error("Error al obtener productos");
        }

        const datosProductos = await respuestaProductos.json();
        setProductos(datosProductos?.products?.datos ?? []);

        // La falla de promociones no rompe la búsqueda: solo se pierden las cucardas
        if (respuestaPromociones.ok) {
          const datosPromociones = await respuestaPromociones.json();
          setPromociones((datosPromociones?.promociones as Promocion[]) ?? []);
        } else {
          setPromociones([]);
        }
      } catch (error) {
        setMensajeError(
          error instanceof Error ? error.message : "Error desconocido",
        );
        setProductos([]);
        setPromociones([]);
      } finally {
        setCargando(false);
      }
    };
    cargarResultados();
  }, [termino]);

  return { productos, promociones, cargando, mensajeError, tipoBusqueda, termino };
};
