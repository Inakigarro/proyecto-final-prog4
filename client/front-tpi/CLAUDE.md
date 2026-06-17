@AGENTS.md

# Frontend — client/front-tpi

Next.js 16 (App Router) + React 19 + TypeScript 5. Ver el CLAUDE.md raíz para contexto completo del proyecto.

## Gestión de estado

**Redux Toolkit** es la fuente de verdad. Los contextos (`AuthContext`, `CartContext`) son adaptadores que exponen una API estable por encima del store — no agregan estado propio.

```
store/
├── authSlice.ts   # { usuario, isAutenticado, isCargando }
├── cartSlice.ts   # { items, hidratado, ultimoAgregado, drawerAbierto, validacion, conflictoLogin }
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
- `solicitarReset(email)` — envía email de reset via backend (nodemailer/SMTP)
- `resetearPassword(token, password)` — confirma el nuevo password con el token recibido por email
- `tienePermiso(recurso, accion)` — RBAC granular
- `tieneRol(nombre)`, `esSuperAdmin()` — RBAC por rol

## Carrito

`CartContext.tsx` expone `useCart()` con: `state` (items + validacion + flags), `subtotalEstimado`, `agregar`, `quitar`, `actualizarCantidad`, `vaciar`, `abrirDrawer`, `cerrarDrawer`.

- `localStorageMiddleware` persiste automáticamente tras cada acción de carrito, bajo la key `techpoint:cart:{userId}` (logueado) o `techpoint:cart:guest` (sin sesión). Solo persiste cuando `hidratado === true` y no hay conflicto activo.
- **Conflicto de carrito**: si al loguearse el usuario tenía items como guest y también items guardados de sesión anterior, `cartSlice` activa `conflictoLogin`. El `ConflictoCarritoModal` (montado globalmente en el layout) presenta los dos carritos y deja elegir entre guest, sesión anterior o combinar ambos.
- La validación de stock y precios se hace llamando a `POST /api/cart/validate` via el thunk `validarCarrito` en `cartSlice`; el hook `useValidacionCarrito` lo dispara con debounce desde `CartPageClient`.
- `validacion` en el estado Redux es un discriminated union: `{ tipo: 'idle' | 'cargando' | 'ok' | 'error' }`.

## Checkout

`CartPageClient.tsx` implementa el flujo completo de compra en 3 pasos + confirmación:

1. **Carrito** — listado de items, resumen de precios, validación de stock.
2. **Envío** — `CheckoutEnvioForm`: selector de dirección guardada o formulario de dirección nueva. Gestiona `DatosEnvioDto`.
3. **Pago** — `CheckoutPagoForm`: datos de tarjeta (marca + últimos 4). Gestiona `DatosTarjetaDto`.
4. **Confirmación** — pantalla inline tras el POST exitoso a `/api/cart/checkout`.

`CheckoutStepper.tsx` muestra el progreso visual. Al confirmar pago se llama a `POST /api/cart/checkout` con el `CheckoutDto` armado; en éxito se vacía el carrito y se muestra la confirmación.

## Fetch de datos

`lib/api.ts` exporta `apiFetch(path, options)`:
- Agrega automáticamente el header `Authorization: Bearer <accessToken>` cuando hay sesión activa.
- Lanza `ApiError` con `status` y `body` en errores HTTP.

Para datos públicos en Server Components:
- `lib/productos.ts` — `obtenerProductos()`
- `lib/promociones.ts` — `obtenerPromociones()`
- `lib/slides.ts` — `obtenerSlides()` (sin caché, para que el dueño vea cambios al instante)

## Rutas existentes

| Ruta | Componente | Estado |
|------|-----------|--------|
| `/` | `app/page.tsx` | Implementado |
| `/carrito` | `app/carrito/page.tsx` + `CartPageClient` | Implementado (checkout completo) |
| `/login` | `app/login/page.tsx` | Implementado |
| `/registro` | `app/registro/page.tsx` | Implementado |
| `/recuperar-contrasena` | `app/recuperar-contrasena/page.tsx` | Implementado |
| `/perfil` | `app/perfil/page.tsx` | Implementado (4 tabs: datos, direcciones, compras, seguridad) |
| `/product-detail-page/[id]` | PDP con slider de relacionados | Implementado |
| `/search-result` | `ListaResultadosProductos` | Implementado |
| `/promociones` | `app/promociones/page.tsx` | Implementado |
| `/promociones/[id]` | `app/promociones/[id]/page.tsx` | Implementado |
| `/quienes-somos` | `app/quienes-somos/page.tsx` | Implementado |
| `/dashboard` | `app/dashboard/layout.tsx` + `page.tsx` | Implementado (roles `dueno` y `superadmin`) |
| `/dashboard/productos` | `app/dashboard/productos/page.tsx` | Implementado |
| `/dashboard/categorias` | `app/dashboard/categorias/page.tsx` | Implementado |
| `/dashboard/promociones` | `app/dashboard/promociones/page.tsx` | Implementado |
| `/dashboard/slider` | `app/dashboard/slider/page.tsx` | Implementado |

## Rewrites de Next.js (importante)

`next.config.ts` tiene un rewrite catch-all `source: "/api/:path*"` → `destination: "${BACKEND_URL}/api/:path*"`. Comportamiento:

- Las API routes en `app/api/` toman **precedencia** sobre el rewrite para sus paths exactos (son "afterFiles")
- `GET /api/products` → `app/api/products/route.ts` (solo GET; envuelve respuesta en `{ success, products }`)
- `GET /api/promotions` → `app/api/promotions/route.ts` (solo GET; envuelve en `{ success, promociones }`)
- Todo lo demás → rewrite → Express directamente (headers incluyendo `Authorization` se reenvían)
- El dashboard usa `app/api/dashboard/products|categories|promotions|slides/route.ts` como proxies transparentes que devuelven la respuesta cruda de Express, evitando la interferencia de las rutas existentes. Todos comparten el helper `app/api/dashboard/_helpers.ts` (`proxyA()`)
