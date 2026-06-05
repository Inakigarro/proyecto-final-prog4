/**
 * authSlice — slice de Redux para la sesión del usuario.
 *
 * Define el estado de autenticación y los reducers síncronos.
 * La lógica async (login, logout, refresh) vive en el adapter
 * AuthContext.tsx, que despacha estas acciones al completarse.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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

const ESTADO_INICIAL: AuthState = {
  usuario: null,
  isAutenticado: false,
  isCargando: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: ESTADO_INICIAL,
  reducers: {
    /** Sesión restaurada o login exitoso: guarda el perfil. */
    hidratado(state, action: PayloadAction<UsuarioPerfil>) {
      state.usuario = action.payload;
      state.isAutenticado = true;
      state.isCargando = false;
    },

    /** No había sesión guardada: marca la carga como terminada. */
    cargaCompleta(state) {
      state.isCargando = false;
    },

    /** Cierra la sesión y limpia el estado. */
    logout(state) {
      state.usuario = null;
      state.isAutenticado = false;
      state.isCargando = false;
    },
  },
});

export const { hidratado, cargaCompleta, logout } = authSlice.actions;

export default authSlice.reducer;
