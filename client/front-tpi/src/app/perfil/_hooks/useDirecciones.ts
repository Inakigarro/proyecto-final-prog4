'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import type { Direccion } from '../_types';

/**
 * Estado expuesto por el hook useDirecciones.
 */
export interface EstadoDirecciones {
  /** Lista de direcciones del usuario autenticado */
  direcciones: Direccion[];
  /** True durante la carga inicial o un refetch */
  cargando: boolean;
  /** Mensaje de error de la última operación (carga o eliminación) */
  error: string | null;
  /** Recarga la lista desde el backend */
  recargar: () => Promise<void>;
  /** Elimina una dirección por id y actualiza la lista local */
  eliminar: (id: string) => Promise<void>;
}

/**
 * Hook que encapsula el ciclo de vida de las direcciones del usuario.
 *
 * - Hace fetch a GET /api/addresses/me al montar.
 * - Expone una función eliminar() que pega contra DELETE /api/addresses/:id
 *   y, si todo va bien, saca la dirección de la lista en memoria.
 *
 * @param habilitado - Si false, no dispara el fetch inicial. Útil para esperar
 *                     a que la sesión esté hidratada antes de llamar al backend.
 */
export function useDirecciones(habilitado: boolean): EstadoDirecciones {
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await apiFetch<Direccion[]>('/api/addresses/me');
      setDirecciones(datos);
    } catch (err) {
      const mensaje = err instanceof ApiError ? err.message : 'No se pudieron cargar las direcciones.';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!habilitado) return;
    void cargar();
  }, [habilitado, cargar]);

  /**
   * Elimina una dirección y la quita del estado local solo si el backend responde 204.
   * Si falla, mantiene la lista como estaba y registra el error.
   */
  const eliminar = useCallback(async (id: string) => {
    setError(null);
    try {
      await apiFetch<null>(`/api/addresses/${id}`, { method: 'DELETE' });
      setDirecciones((previas) => previas.filter((d) => d.id !== id));
    } catch (err) {
      const mensaje = err instanceof ApiError ? err.message : 'No se pudo eliminar la dirección.';
      setError(mensaje);
      throw err;
    }
  }, []);

  return { direcciones, cargando, error, recargar: cargar, eliminar };
}
