'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { setAccessToken } from '@/lib/api';

// ── Tipos públicos ────────────────────────────────────────────────────────────

export type AccionPermiso = 'create' | 'read' | 'update' | 'delete';

export interface Permiso {
  id: string;
  nombre: string;
  recurso: string;
  accion: AccionPermiso;
  descripcion?: string;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
  permisos: Permiso[];
}

export interface UsuarioPerfil {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  roles: Rol[];
}

export interface AuthState {
  usuario: UsuarioPerfil | null;
  isAutenticado: boolean;
  /** true mientras se verifica si hay una sesión guardada (hidratación inicial) */
  isCargando: boolean;
}

// ── Reducer ───────────────────────────────────────────────────────────────────

type AuthAction =
  | { type: 'HIDRATADO'; payload: UsuarioPerfil }
  | { type: 'CARGA_COMPLETA' }
  | { type: 'LOGOUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'HIDRATADO':
      return { usuario: action.payload, isAutenticado: true, isCargando: false };
    case 'CARGA_COMPLETA':
      return { ...state, isCargando: false };
    case 'LOGOUT':
      return { usuario: null, isAutenticado: false, isCargando: false };
    default:
      return state;
  }
}

// ── Contexto ──────────────────────────────────────────────────────────────────

interface AuthContextValue {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  tienePermiso: (recurso: string, accion: AccionPermiso) => boolean;
  tieneRol: (nombre: string) => boolean;
  esSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Constantes ────────────────────────────────────────────────────────────────

const REFRESH_TOKEN_KEY = 'techpoint:refresh_token';
/** Refresca el access token 1 minuto antes de que expire (token dura 15 min) */
const INTERVALO_REFRESH_MS = 14 * 60 * 1000;

// ── Helpers de red (fuera del componente para no recrearse) ───────────────────

async function fetchPerfil(accessToken: string): Promise<UsuarioPerfil> {
  const res = await fetch('/api/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('No se pudo obtener el perfil del usuario');
  return res.json() as Promise<UsuarioPerfil>;
}

// ── Proveedor ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    usuario: null,
    isAutenticado: false,
    isCargando: true,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Intenta renovar la sesión usando el refresh token guardado en localStorage.
   * Si tiene éxito, actualiza el access token en memoria y el perfil en el estado.
   * Si falla (token vencido/inválido), cierra la sesión.
   * Al finalizar con éxito, programa el próximo refresh automático.
   */
  const intentarRefresh = useCallback(async (): Promise<void> => {
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefresh) {
      setAccessToken(null);
      dispatch({ type: 'LOGOUT' });
      return;
    }

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefresh }),
      });

      if (!res.ok) throw new Error('Refresh token inválido o expirado');

      const { accessToken, refreshToken: nuevoRefresh } = await res.json() as {
        accessToken: string;
        refreshToken: string;
      };

      localStorage.setItem(REFRESH_TOKEN_KEY, nuevoRefresh);
      setAccessToken(accessToken);

      const usuario = await fetchPerfil(accessToken);
      dispatch({ type: 'HIDRATADO', payload: usuario });

      // Programar próxima renovación automática
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(intentarRefresh, INTERVALO_REFRESH_MS);
    } catch {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setAccessToken(null);
      if (timerRef.current) clearTimeout(timerRef.current);
      dispatch({ type: 'LOGOUT' });
    }
  }, []); // dispatch y timerRef son referencias estables

  // Hidratación inicial: si hay refresh token guardado, restaurar la sesión
  useEffect(() => {
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!storedRefresh) {
      dispatch({ type: 'CARGA_COMPLETA' });
      return;
    }

    intentarRefresh();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [intentarRefresh]);

  /**
   * Inicia sesión con email y contraseña.
   * Lanza un Error con el mensaje del backend si las credenciales son inválidas.
   */
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(data.message ?? 'Error al iniciar sesión');
      }

      const { accessToken, refreshToken } = await res.json() as {
        accessToken: string;
        refreshToken: string;
      };

      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      setAccessToken(accessToken);

      const usuario = await fetchPerfil(accessToken);
      dispatch({ type: 'HIDRATADO', payload: usuario });

      // Programar renovación automática
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(intentarRefresh, INTERVALO_REFRESH_MS);
    },
    [intentarRefresh]
  );

  /**
   * Cierra la sesión. Intenta revocar el refresh token en el backend (best effort)
   * y siempre limpia el estado local.
   */
  const logout = useCallback(async (): Promise<void> => {
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (storedRefresh) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: storedRefresh }),
        });
      } catch {
        // Ignorar errores de red — siempre cerramos la sesión localmente
      }
    }

    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAccessToken(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    dispatch({ type: 'LOGOUT' });
  }, []);

  /** Verifica si el usuario tiene un permiso específico sobre un recurso */
  const tienePermiso = useCallback(
    (recurso: string, accion: AccionPermiso): boolean => {
      if (!state.usuario) return false;
      return state.usuario.roles
        .flatMap((r) => r.permisos)
        .some((p) => p.recurso === recurso && p.accion === accion);
    },
    [state.usuario]
  );

  /** Verifica si el usuario tiene un rol por nombre */
  const tieneRol = useCallback(
    (nombre: string): boolean => {
      return state.usuario?.roles.some((r) => r.nombre === nombre) ?? false;
    },
    [state.usuario]
  );

  /** Verifica si el usuario tiene el rol superadmin */
  const esSuperAdmin = useCallback(
    (): boolean => tieneRol('superadmin'),
    [tieneRol]
  );

  return (
    <AuthContext.Provider
      value={{ state, login, logout, tienePermiso, tieneRol, esSuperAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
