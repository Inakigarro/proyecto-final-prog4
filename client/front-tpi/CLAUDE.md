@AGENTS.md

# Frontend — client/front-tpi

Next.js (App Router) + React 19 + TypeScript 5. Ver el CLAUDE.md raíz para contexto completo del proyecto.

## Gestión de estado

**Redux Toolkit** es la fuente de verdad. Los contextos (`AuthContext`, `CartContext`) son adaptadores que exponen una API estable por encima del store — no agregan estado propio.

```
store/
├── authSlice.ts   # { usuario, isAutenticado, isCargando }
├── cartSlice.ts   # { items, hidratado, ultimoAgregado, drawerAbierto }
└── hooks.ts       # useAppDispatch / useAppSelector tipados
```

Nunca leer el store con `useSelector` genérico — siempre usar los hooks tipados de `store/hooks.ts`.

## Autenticación

`AuthContext.tsx` maneja todo el ciclo de vida de la sesión:

- **Hidratación al montar**: `AuthHidratator` busca `techpoint:refresh_token` en localStorage; si existe llama a `intentarRefresh()`.
- **Tokens**: access token en memoria (variable módulo en `lib/api.ts` via `setAccessToken`); refresh token en localStorage.
- **Refresh automático**: timer de 14 min (el access token dura 15 min).
- **Logout**: best-effort al backend + limpieza local siempre.

Helpers disponibles en `useAuth()`: `login`, `logout`, `tienePermiso(recurso, accion)`, `tieneRol(nombre)`, `esSuperAdmin()`.

## Carrito

`CartContext.tsx` expone `useCart()` con: `items`, `agregar`, `quitar`, `actualizarCantidad`, `vaciar`, `abrirDrawer`, `cerrarDrawer`.

- `localStorageMiddleware` persiste automáticamente tras cada acción (solo cuando `hidratado === true`).
- La validación de stock y precios se hace llamando a `POST /api/cart/validate` con debounce de 500 ms desde `CartPageClient`.
- **Checkout pendiente**: `CartPageClient.tsx:140` tiene el TODO para `POST /api/cart/checkout`.

## Fetch de datos

`lib/api.ts` exporta `apiFetch(path, options)`:
- Agrega automáticamente el header `Authorization: Bearer <accessToken>` cuando hay sesión activa.
- Lanza `ApiError` con `status` y `body` en errores HTTP.

Para datos públicos en Server Components usar `lib/productos.ts` (`obtenerProductos`).

## Rutas existentes

| Ruta | Componente | Estado |
|------|-----------|--------|
| `/` | `app/page.tsx` | Implementado |
| `/carrito` | `app/carrito/page.tsx` + `CartPageClient` | Implementado (checkout pendiente) |
| `/product-detail-page/[id]` | PDP con slider de relacionados | Implementado |
| `/search-result` | `ListaResultadosProductos` | Implementado |

## Pendiente

- **Checkout**: conectar `handleConfirmarCompra` a `POST /api/cart/checkout` y crear página de confirmación de orden.
- **Registro**: crear `app/registro/page.tsx`. El componente `src/app/api/RegisterPage/RegisterPage.tsx` está en ruta incorrecta.
- **Perfil de usuario**: no hay ruta ni componente (backend tiene `GET /api/users/me`).
- **Historial de órdenes**: sin UI.
- **Reset de contraseña**: el backend soporta el flujo completo; falta la UI.
