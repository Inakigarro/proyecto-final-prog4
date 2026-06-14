'use client';

import { useEffect, useState } from 'react';
import type { CompraResumen } from '../_types';

/**
 * Estado expuesto por el hook useCompras.
 */
export interface EstadoCompras {
  compras: CompraResumen[];
  cargando: boolean;
  error: string | null;
}

/**
 * Hook que en el futuro cargará el historial de compras del usuario autenticado.
 *
 * TODO(Franco): conectar con el endpoint del backend cuando esté terminado el
 * módulo de pedidos. Posible forma: GET /api/orders/me que devuelva
 * `CompraResumen[]`. Mientras tanto, devuelve una lista vacía para que la UI
 * muestre el estado "sin compras todavía" sin hacer llamadas de red.
 *
 * @param habilitado - Si false, no dispara la carga. Reservado para cuando se
 *                     conecte el endpoint real.
 */
export function useCompras(habilitado: boolean): EstadoCompras {
  const [compras, setCompras] = useState<CompraResumen[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    if (!habilitado) return;
    // TODO(Franco): reemplazar por una llamada real a apiFetch('/api/orders/me')
    setCargando(true);
    const timer = setTimeout(() => {
      setCompras([]);
      setCargando(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [habilitado]);

  return { compras, cargando, error };
}
