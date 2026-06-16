'use client';

import { useEffect, useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import type { OrdenDetalle } from '@/lib/order-types';

/**
 * Estado expuesto por el hook useOrdenDetalle.
 */
export interface EstadoOrdenDetalle {
  /** Detalle completo de la orden o null si todavía no se cargó. */
  orden: OrdenDetalle | null;
  /** True mientras llega el detalle desde el backend. */
  cargando: boolean;
  /** Mensaje de error de la última operación; null si todo OK. */
  error: string | null;
}

/**
 * Hook que carga el detalle de una orden particular del usuario autenticado.
 *
 * Pega contra `GET /api/orders/me/:id`. Si `ordenId` cambia, refetchea
 * automáticamente. Si `ordenId` es null o vacío, queda en estado idle.
 *
 * @param ordenId - Id de la orden a consultar; null mientras no haya selección.
 * @param habilitado - Si false, no dispara el fetch.
 */
export function useOrdenDetalle(
  ordenId: string | null,
  habilitado: boolean,
): EstadoOrdenDetalle {
  const [orden, setOrden] = useState<OrdenDetalle | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!habilitado || !ordenId) {
      setOrden(null);
      setError(null);
      return;
    }

    let cancelado = false;
    setCargando(true);
    setError(null);

    apiFetch<OrdenDetalle>(`/api/orders/me/${ordenId}`)
      .then((datos) => {
        if (cancelado) return;
        setOrden(datos);
      })
      .catch((err: unknown) => {
        if (cancelado) return;
        const mensaje = err instanceof ApiError ? err.message : 'No se pudo cargar la compra.';
        setError(mensaje);
        setOrden(null);
      })
      .finally(() => {
        if (cancelado) return;
        setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [ordenId, habilitado]);

  return { orden, cargando, error };
}
