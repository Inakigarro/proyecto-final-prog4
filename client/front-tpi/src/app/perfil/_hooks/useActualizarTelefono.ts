'use client';

import { useCallback, useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import { useAppDispatch } from '@/store/hooks';
import { perfilActualizado, type UsuarioPerfil } from '@/store/authSlice';

/**
 * Regex para teléfonos de Argentina con código de país.
 * Empieza con +54, opcionalmente seguido de un 9 (móvil), luego entre 10 y 11
 * dígitos en total separados por espacios o guiones.
 *
 * Espejo del validador del backend (server/src/models/User.ts).
 */
export const TELEFONO_AR_REGEX = /^\+54[\s-]?9?[\s-]?\d{2,4}[\s-]?\d{3,4}[\s-]?\d{4}$/;

/**
 * Estado expuesto por el hook useActualizarTelefono.
 */
export interface EstadoTelefono {
  /** True mientras se está guardando el cambio en el backend */
  guardando: boolean;
  /** Mensaje de error de la última operación, o null si fue exitosa */
  error: string | null;
  /** True si el último guardado terminó OK (se resetea al volver a guardar) */
  exito: boolean;
  /** Envía el nuevo teléfono al backend y refresca el perfil en Redux */
  guardar: (telefono: string) => Promise<void>;
}

/**
 * Hook para editar el teléfono del usuario autenticado.
 *
 * Hace PUT /api/users/me con el campo teléfono y, si el backend responde OK,
 * despacha perfilActualizado al store para que el resto de la app vea el
 * nuevo valor sin necesidad de recargar la sesión.
 *
 * Permite enviar un string vacío para "limpiar" el teléfono almacenado.
 */
export function useActualizarTelefono(): EstadoTelefono {
  const dispatch = useAppDispatch();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const guardar = useCallback(
    async (telefono: string) => {
      setGuardando(true);
      setError(null);
      setExito(false);
      try {
        const usuario = await apiFetch<UsuarioPerfil>('/api/users/me', {
          method: 'PUT',
          body: JSON.stringify({ telefono: telefono.trim() }),
        });
        dispatch(perfilActualizado(usuario));
        setExito(true);
      } catch (err) {
        const mensaje = err instanceof ApiError ? err.message : 'No se pudo guardar el teléfono.';
        setError(mensaje);
        throw err;
      } finally {
        setGuardando(false);
      }
    },
    [dispatch]
  );

  return { guardando, error, exito, guardar };
}
