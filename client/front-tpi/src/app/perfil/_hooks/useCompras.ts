'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import type { OrdenResumen } from '@/lib/order-types';

/**
 * Estado expuesto por el hook useCompras.
 */
export interface EstadoCompras {
  /** Historial de órdenes del usuario, más recientes primero. */
  compras: OrdenResumen[];
  /** True durante la carga inicial o un refetch explícito. */
  cargando: boolean;
  /** Mensaje de error de la última operación; null si todo OK. */
  error: string | null;
  /** Recarga el listado desde el backend (útil tras una nueva compra). */
  recargar: () => Promise<void>;
}

/**
 * Hook que carga el historial de compras del usuario autenticado.
 *
 * Pega contra `GET /api/orders/me` y devuelve los resúmenes. El detalle de
 * una orden específica se obtiene por separado con {@link useOrdenDetalle}.
 *
 * @param habilitado - Si false, no dispara el fetch. Útil para esperar a que
 *                     la sesión esté hidratada antes de llamar al backend.
 */
export function useCompras(habilitado: boolean): EstadoCompras {
  const [compras, setCompras] = useState<OrdenResumen[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await apiFetch<OrdenResumen[]>('/api/orders/me');
      setCompras(datos);
    } catch (err) {
      const mensaje = err instanceof ApiError ? err.message : 'No se pudieron cargar las compras.';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!habilitado) return;
    void cargar();
  }, [habilitado, cargar]);

  return { compras, cargando, error, recargar: cargar };
}
