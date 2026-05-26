"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { Producto } from "../types";

interface UseProductoResult {
  /** Datos del producto. `null` mientras carga o si hubo error. */
  producto: Producto | null;
  loading: boolean;
  /** Mensaje de error legible para mostrar en pantalla, o `null` si no hay error. */
  error: string | null;
}

/**
 * Obtiene un producto por ID desde la API.
 *
 * Usa `apiFetch` para normalizar errores y adjuntar el token de auth
 * de forma consistente con el resto del proyecto.
 *
 * @param id - ID del producto a cargar. Si es falsy, no dispara ningún fetch.
 * @returns Estado de carga, el producto (o null) y un posible mensaje de error.
 */
export function useProducto(id: string | undefined): UseProductoResult {
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelado = false;

    const cargar = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch<Producto>(`/api/products/${id}`);
        if (!cancelado) setProducto(data);
      } catch (err) {
        if (cancelado) return;
        if (err instanceof ApiError && err.status === 404) {
          setError("Producto no encontrado");
        } else {
          setError(err instanceof Error ? err.message : "Error al cargar el producto");
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    cargar();

    // Evita actualizar estado si el componente se desmontó antes de recibir la respuesta.
    return () => { cancelado = true; };
  }, [id]);

  return { producto, loading, error };
}
