/**
 * cartSlice — slice de Redux para el carrito de compras.
 *
 * Define el estado, las acciones y los reducers del carrito, e incluye la
 * validación del carrito contra el backend (POST /api/cart/validate) como
 * thunk asíncrono — así el drawer y la página completa comparten el mismo
 * estado de validación.
 *
 * No persiste por sí mismo: la persistencia en localStorage se maneja
 * desde el middleware (localStorageMiddleware.ts) para mantener este slice
 * puro y testeable.
 */

import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { apiFetch, ApiError } from '@/lib/api';
import type {
  CartItem,
  ValidacionCarritoResponse,
  ValidarCarritoDto,
} from '@/lib/cart-types';

/**
 * Estado de la validación del carrito contra el backend.
 * Modelado como discriminated union para que el consumidor sepa qué
 * campos están disponibles según el estado.
 */
export type EstadoValidacion =
  | { tipo: 'idle' }
  | { tipo: 'cargando' }
  | { tipo: 'ok'; data: ValidacionCarritoResponse }
  | { tipo: 'error'; mensaje: string; status: number };

interface ErrorValidacion {
  mensaje: string;
  status: number;
}

/**
 * Snapshot de carritos en conflicto al loguearse: el usuario tenía un carrito
 * armado como guest Y un carrito guardado de una sesión anterior. La UI muestra
 * un modal para que elija con cuál seguir; el slice mantiene los dos snapshots
 * hasta que se resuelve el conflicto.
 */
export interface ConflictoLoginCarrito {
  /** Items que estaban bajo la key guest al momento de loguearse. */
  guestItems: CartItem[];
  /** Items que estaban guardados bajo la key del usuario. */
  userItems: CartItem[];
}

/** Estado interno del carrito. */
export interface CartState {
  items: CartItem[];
  hidratado: boolean;
  ultimoAgregado: CartItem | null;
  drawerAbierto: boolean;
  /** Resultado de la última validación del carrito. */
  validacion: EstadoValidacion;
  /**
   * requestId del thunk de validación actualmente "vigente".
   * Sirve para descartar respuestas obsoletas: cuando llega un fulfilled/rejected
   * cuyo requestId no coincide con el vigente, se ignora.
   */
  requestIdValidacion: string | null;
  /**
   * Conflicto pendiente entre el carrito guest y el carrito previo del usuario
   * al loguearse. Cuando es `null` no hay conflicto activo.
   */
  conflictoLogin: ConflictoLoginCarrito | null;
}

const ESTADO_INICIAL: CartState = {
  items: [],
  hidratado: false,
  ultimoAgregado: null,
  drawerAbierto: false,
  validacion: { tipo: 'idle' },
  requestIdValidacion: null,
  conflictoLogin: null,
};

/**
 * Thunk que valida el carrito contra el backend.
 * El thunkAPI provee `signal` que se pasa a `apiFetch` para que la request
 * se aborte si el thunk se cancela (ej. al desmontar el componente).
 */
export const validarCarrito = createAsyncThunk<
  ValidacionCarritoResponse,
  ValidarCarritoDto,
  { rejectValue: ErrorValidacion }
>('cart/validar', async (dto, { signal, rejectWithValue }) => {
  try {
    return await apiFetch<ValidacionCarritoResponse>('/api/cart/validate', {
      method: 'POST',
      body: JSON.stringify(dto),
      signal,
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return rejectWithValue({ mensaje: err.message, status: err.status });
    }
    return rejectWithValue({
      mensaje:
        err instanceof Error
          ? err.message
          : 'Error inesperado al validar el carrito.',
      status: 0,
    });
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: ESTADO_INICIAL,
  reducers: {
    /**
     * Hidrata el estado desde la fuente persistida (localStorage).
     * Limpia cualquier conflicto de login pendiente: si llegamos a hidratar,
     * la decisión sobre qué carrito usar ya está tomada o el contexto cambió
     * (ej. logout durante el modal).
     */
    hidratar(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      state.hidratado = true;
      state.conflictoLogin = null;
    },

    /**
     * Agrega un item. Si ya existe (mismo itemId), suma la cantidad.
     * Setea ultimoAgregado para disparar el toast.
     */
    agregar(state, action: PayloadAction<CartItem>) {
      const incoming = action.payload;
      const existente = state.items.find((i) => i.itemId === incoming.itemId);

      if (existente) {
        existente.cantidad += incoming.cantidad;
      } else {
        state.items.push(incoming);
      }

      state.ultimoAgregado = { ...incoming };
    },

    /** Quita un item del carrito por id. */
    quitar(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.itemId !== action.payload);
    },

    /**
     * Cambia la cantidad de un item. Si la cantidad nueva es <= 0,
     * elimina el item.
     */
    actualizarCantidad(
      state,
      action: PayloadAction<{ itemId: string; cantidad: number }>
    ) {
      const { itemId, cantidad } = action.payload;
      if (cantidad <= 0) {
        state.items = state.items.filter((i) => i.itemId !== itemId);
        return;
      }
      const item = state.items.find((i) => i.itemId === itemId);
      if (item) item.cantidad = cantidad;
    },

    /** Vacía completamente el carrito y cierra cualquier conflicto pendiente. */
    vaciar(state) {
      state.items = [];
      state.conflictoLogin = null;
    },

    /** Cierra el toast de confirmación (limpia ultimoAgregado). */
    cerrarConfirmacion(state) {
      state.ultimoAgregado = null;
    },

    /** Abre el drawer lateral del carrito. */
    abrirDrawer(state) {
      state.drawerAbierto = true;
    },

    /** Cierra el drawer lateral del carrito. */
    cerrarDrawer(state) {
      state.drawerAbierto = false;
    },

    /**
     * Resetea la validación al estado `idle`. Se usa cuando se vacía el carrito
     * o cuando el componente que estaba validando se desmonta.
     */
    resetValidacion(state) {
      state.validacion = { tipo: 'idle' };
      state.requestIdValidacion = null;
    },

    /**
     * Marca que hay un conflicto entre el carrito guest y el carrito guardado
     * del usuario tras loguearse. El `CartHidratator` despacha esta acción en
     * lugar de hidratar para que la UI muestre el modal de elección.
     *
     * Mientras hay conflicto, `hidratado` se mantiene en true para que la app
     * no quede en estado de carga, pero `items` queda vacío para evitar
     * acciones del usuario sobre un carrito ambiguo.
     */
    iniciarConflictoLogin(state, action: PayloadAction<ConflictoLoginCarrito>) {
      state.conflictoLogin = action.payload;
      state.items = [];
      state.hidratado = true;
    },

    /**
     * Resuelve el conflicto reemplazando el carrito con el snapshot elegido
     * por el usuario ('guest' = lo que arrastraba sin sesión, 'user' = lo
     * guardado de la sesión anterior). La limpieza del localStorage de la
     * key descartada la hace el componente del modal.
     */
    resolverConflictoLogin(state, action: PayloadAction<'guest' | 'user'>) {
      if (!state.conflictoLogin) return;
      const elegidos = action.payload === 'guest'
        ? state.conflictoLogin.guestItems
        : state.conflictoLogin.userItems;
      state.items = elegidos;
      state.conflictoLogin = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(validarCarrito.pending, (state, action) => {
        // El requestId del thunk pendiente pasa a ser el vigente
        state.validacion = { tipo: 'cargando' };
        state.requestIdValidacion = action.meta.requestId;
      })
      .addCase(validarCarrito.fulfilled, (state, action) => {
        // Descartar si llegó una respuesta posterior antes
        if (state.requestIdValidacion !== action.meta.requestId) return;
        state.validacion = { tipo: 'ok', data: action.payload };
        state.requestIdValidacion = null;
      })
      .addCase(validarCarrito.rejected, (state, action) => {
        if (state.requestIdValidacion !== action.meta.requestId) return;
        // Ignorar errores de "AbortError" (el thunk fue cancelado a propósito)
        if (action.meta.aborted) {
          return;
        }
        const error = action.payload ?? {
          mensaje: 'Error desconocido al validar el carrito.',
          status: 0,
        };
        state.validacion = {
          tipo: 'error',
          mensaje: error.mensaje,
          status: error.status,
        };
        state.requestIdValidacion = null;
      });
  },
});

export const {
  hidratar,
  agregar,
  quitar,
  actualizarCantidad,
  vaciar,
  cerrarConfirmacion,
  abrirDrawer,
  cerrarDrawer,
  resetValidacion,
  iniciarConflictoLogin,
  resolverConflictoLogin,
} = cartSlice.actions;

export default cartSlice.reducer;
