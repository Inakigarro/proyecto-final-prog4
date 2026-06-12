@AGENTS.md

# Frontend — client/front-tpi

Next.js 16 (App Router) + React 19 + TypeScript 5. Ver el CLAUDE.md raíz para contexto completo del proyecto.

## Gestión de estado

**Redux Toolkit** es la fuente de verdad. Los contextos (`AuthContext`, `CartContext`) son adaptadores que exponen una API estable por encima del store — no agregan estado propio.

```
store/
├── authSlice.ts   # { usuario, isAutenticado, isCargando }
├── cartSlice.ts   # { items, hidratado, ultimoAgregado, drawerAbierto, validacion }
└── hooks.ts       # useAppDispatch / useAppSelector tipados
```

Nunca leer el store con `useSelector` genérico — siempre usar los hooks tipados de `store/hooks.ts`.

## Autenticación

`AuthContext.tsx` maneja todo el ciclo de vida de la sesión:

- **Hidratación al montar**: `AuthHidratator` busca `techpoint:refresh_token` en localStorage; si existe llama a `intentarRefresh()`.
- **Tokens**: access token en memoria (variable módulo en `lib/api.ts` via `setAccessToken`); refresh token en localStorage.
- **Refresh automático**: timer de 14 min (el access token dura 15 min).
- **Logout**: best-effort al backend + limpieza local siempre.

Helpers disponibles en `useAuth()`:
- `login(email, password)` — inicia sesión
- `logout()` — cierra sesión
- `registrar(RegistrarInput)` — crea cuenta nueva
- `solicitarReset(email)` — envía email de reset via backend (Resend)
- `resetearPassword(token, password)` — confirma el nuevo password con el token recibido por email
- `tienePermiso(recurso, accion)` — RBAC granular
- `tieneRol(nombre)`, `esSuperAdmin()` — RBAC por rol

## Carrito

`CartContext.tsx` expone `useCart()` con: `items`, `agregar`, `quitar`, `actualizarCantidad`, `vaciar`, `abrirDrawer`, `cerrarDrawer`.

- `localStorageMiddleware` persiste automáticamente tras cada acción (solo cuando `hidratado === true`).
- La validación de stock y precios se hace llamando a `POST /api/cart/validate` via el thunk `validarCarrito` en `cartSlice`; el hook `useValidacionCarrito` lo dispara con debounce desde `CartPageClient`.
- `validacion` en el estado Redux registra: `idle | cargando | ok | error` y el resultado de la última validación.
- **Checkout pendiente**: `CartPageClient.tsx` tiene el TODO en `handleConfirmarCompra` para llamar a `POST /api/cart/checkout`.

## Fetch de datos

`lib/api.ts` exporta `apiFetch(path, options)`:
- Agrega automáticamente el header `Authorization: Bearer <accessToken>` cuando hay sesión activa.
- Lanza `ApiError` con `status` y `body` en errores HTTP.

Para datos públicos en Server Components:
- `lib/productos.ts` — `obtenerProductos()`
- `lib/promociones.ts` — `obtenerPromociones()`

## Rutas existentes

| Ruta | Componente | Estado |
|------|-----------|--------|
| `/` | `app/page.tsx` | Implementado |
| `/carrito` | `app/carrito/page.tsx` + `CartPageClient` | Implementado (checkout pendiente) |
| `/login` | `app/login/page.tsx` | Implementado |
| `/registro` | `app/registro/page.tsx` | Implementado |
| `/recuperar-contrasena` | `app/recuperar-contrasena/page.tsx` | Implementado |
| `/perfil` | `app/perfil/page.tsx` | Implementado (requiere auth) |
| `/product-detail-page/[id]` | PDP con slider de relacionados | Implementado |
| `/search-result` | `ListaResultadosProductos` | Implementado |
| `/promociones` | `app/promociones/page.tsx` | Implementado |
| `/promociones/[id]` | `app/promociones/[id]/page.tsx` | Implementado |

## Pendiente

- **Checkout**: conectar `handleConfirmarCompra` en `CartPageClient.tsx` a `POST /api/cart/checkout` y crear página de confirmación de orden.
- **Perfil de usuario**: página en `/perfil` implementada; usa `PUT /api/users/me` para auto-edición (nombre, apellido, email).
- **Historial de órdenes**: sin UI.
