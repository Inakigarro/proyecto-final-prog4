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
 * Datos editables del perfil propio. Email queda afuera a propósito: se usa
 * como identificador de login y el usuario común no lo puede modificar.
 *
 * Los campos son opcionales: solo se envían los que cambiaron.
 */
export interface CambiosPerfil {
  nombre?: string;
  apellido?: string;
  /** Fecha en formato yyyy-MM-dd (lo que devuelve <input type="date">) */
  fechaNacimiento?: string;
  /** String vacío = limpiar el teléfono almacenado */
  telefono?: string;
}

/**
 * Estado expuesto por el hook useActualizarPerfil.
 */
export interface EstadoPerfil {
  /** True mientras se está guardando el cambio en el backend */
  guardando: boolean;
  /** Mensaje de error de la última operación, o null si fue exitosa */
  error: string | null;
  /** True si el último guardado terminó OK (se resetea al volver a guardar) */
  exito: boolean;
  /** Envía los cambios al backend y refresca el perfil en Redux */
  guardar: (cambios: CambiosPerfil) => Promise<void>;
}

/**
 * Hook para editar los datos personales del usuario autenticado.
 *
 * Hace PUT /api/users/me con los campos provistos y, si el backend responde OK,
 * despacha perfilActualizado al store para que el resto de la app vea los
 * nuevos valores sin necesidad de recargar la sesión.
 */
export function useActualizarPerfil(): EstadoPerfil {
  const dispatch = useAppDispatch();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const guardar = useCallback(
    async (cambios: CambiosPerfil) => {
      setGuardando(true);
      setError(null);
      setExito(false);
      try {
        const usuario = await apiFetch<UsuarioPerfil>('/api/users/me', {
          method: 'PUT',
          body: JSON.stringify(cambios),
        });
        dispatch(perfilActualizado(usuario));
        setExito(true);
      } catch (err) {
        const mensaje = err instanceof ApiError ? err.message : 'No se pudieron guardar los cambios.';
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
