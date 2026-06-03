"use client";

/**
 * Página de detalle de producto (PDP).
 *
 * Responsabilidades de este archivo:
 * - Obtener el ID del producto desde la URL.
 * - Mantener el estado de UI: cantidad y productos seleccionados para comparar.
 * - Coordinar los handlers de carrito y navegación.
 * - Componer el layout con los subcomponentes.
 *
 * La lógica de datos vive en `_hooks/`:
 *   - `useProducto`    → carga el producto principal.
 *   - `useRelacionados` → carga y filtra los productos de la misma categoría.
 * Todo lo visual vive en `_components/`. Los tipos compartidos en `types.ts`.
 */

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

import type { Producto } from "./types";
import { useProducto } from "./_hooks/useProducto";
import { useRelacionados } from "./_hooks/useRelacionados";
import Accordion from "./_components/Accordion";
import HeroProducto from "./_components/HeroProducto";
import PanelInfo from "./_components/PanelInfo";
import RelatedSlider from "./_components/RelatedSlider";
import Comparador from "./_components/Comparador";
import Breadcrumb from "@/component/layout/Breadcrumb";
import styles from "./page.module.css";

/** Cantidad máxima de productos que se pueden comparar con el actual. */
const MAX_COMPARADOS = 3;

/** Ancho máximo de pantalla considerado "mobile" (en píxeles). */
const MOBILE_BREAKPOINT = 768;

export default function PaginaProducto() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { agregar } = useCart();

  const { producto, loading, error } = useProducto(id);
  const relacionados = useRelacionados(producto);

  const [cantidad, setCantidad] = useState(1);
  const [productosComparados, setProductosComparados] = useState<Producto[]>([]);

  /**
   * Agrega el producto al carrito con la cantidad seleccionada.
   * En mobile navega directo a /carrito; en desktop el CartAddedDrawer
   * del layout muestra la confirmación.
   */
  const handleAgregarAlCarrito = useCallback(() => {
    if (!producto) return;
    agregar({
      itemId: producto.id,
      nombre: producto.nombre,
      precioUnitario: producto.precioUnitario,
      cantidad,
    });
    if (window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches) {
      router.push("/carrito");
    }
  }, [producto, cantidad, agregar, router]);

  /**
   * Agrega el producto al carrito y navega directo al carrito,
   * independientemente del viewport.
   */
  const handleComprarAhora = useCallback(() => {
    if (!producto) return;
    agregar({
      itemId: producto.id,
      nombre: producto.nombre,
      precioUnitario: producto.precioUnitario,
      cantidad,
    });
    router.push("/carrito");
  }, [producto, cantidad, agregar, router]);

  /**
   * Agrega o quita un producto de la lista de comparados.
   * Si el producto ya estaba, lo elimina. Si no, lo agrega
   * siempre que no se haya alcanzado el límite MAX_COMPARADOS.
   */
  const toggleComparar = useCallback((p: Producto) => {
    setProductosComparados((prev) => {
      const yaEsta = prev.some((x) => x.id === p.id);
      if (yaEsta) return prev.filter((x) => x.id !== p.id);
      if (prev.length >= MAX_COMPARADOS) return prev;
      return [...prev, p];
    });
  }, []);

  /** Quita un único producto del comparador por su ID. */
  const quitarComparado = useCallback((pid: string) => {
    setProductosComparados((prev) => prev.filter((x) => x.id !== pid));
  }, []);

  // ── Estados de carga / error ────────────────────────────

  if (loading) {
    return <div className={styles.estado}><p>Cargando producto...</p></div>;
  }

  if (error || !producto) {
    return (
      <div className={styles.estado}>
        <p>{error ?? "Producto no encontrado"}</p>
        <button className={styles.volverBtn} onClick={() => router.back()}>
          ← Volver
        </button>
      </div>
    );
  }

  // ── Layout ───────────────────────────────────────────────

  const idsComparados = productosComparados.map((p) => p.id);

  return (
    <div className={styles.pagina}>

      <Breadcrumb segmentos={[{ etiqueta: producto.nombre }]} />

      {/* Hero: imagen del producto + panel de información y acciones */}
      <section className={styles.hero}>
        <HeroProducto
          nombre={producto.nombre}
          imageSrc={producto.imageSrc}
          cucarda={producto.cucarda}
        />
        <PanelInfo
          producto={producto}
          cantidad={cantidad}
          onCantidadChange={setCantidad}
          onAgregarAlCarrito={handleAgregarAlCarrito}
          onComprarAhora={handleComprarAhora}
        />
      </section>

      {/* Descripción colapsable */}
      <section className={styles.seccion}>
        <Accordion titulo="Descripción">
          <p className={styles.descripcionTexto}>
            Este producto aún no tiene una descripción detallada disponible.
          </p>
        </Accordion>
      </section>

      {/* Slider de productos relacionados con opción de comparar */}
      {relacionados.length > 0 && (
        <section className={styles.seccion}>
          <div className={styles.seccionEncabezado}>
            <h2 className={styles.seccionTitulo}>Productos relacionados</h2>
            {productosComparados.length > 0 && (
              <span className={styles.comparadosContador}>
                {productosComparados.length}/{MAX_COMPARADOS} seleccionados para comparar
              </span>
            )}
          </div>

          <RelatedSlider
            productos={relacionados}
            productosComparados={idsComparados}
            maxComparados={MAX_COMPARADOS}
            onToggleComparar={toggleComparar}
          />
        </section>
      )}

      {/* Comparador: aparece cuando hay al menos un producto seleccionado */}
      {productosComparados.length > 0 && (
        <section className={styles.seccion}>
          <Comparador
            actual={producto}
            comparados={productosComparados}
            onQuitar={quitarComparado}
            onLimpiar={() => setProductosComparados([])}
          />
        </section>
      )}

    </div>
  );
}
