# TechPoint — Frontend

Frontend de la aplicación e-commerce TechPoint, construido con **Next.js 16** (App Router) + **React 19** + **TypeScript 5**.

---

## Requisitos

- Node.js v18 o superior
- Backend corriendo en `http://localhost:4000` (ver `server/`)

---

## Instalación

```bash
npm install
```

Crear el archivo `.env.local` en esta carpeta:

```env
BACKEND_URL=http://localhost:4000
```

---

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Modo desarrollo en http://localhost:3000 |
| `npm run build` | Build de producción |
| `npm start` | Sirve el build de producción |
| `npm run lint` | ESLint |

---

## Estructura

```
src/
├── app/              # Páginas y layouts (Next.js App Router)
│   ├── layout.tsx    # RootLayout — AuthProvider > CartProvider > Navbar
│   ├── page.tsx      # Home — slider + productos destacados (SSR)
│   ├── api/          # API Routes como proxies al backend Express
│   ├── carrito/      # Carrito + checkout por pasos
│   ├── perfil/       # Perfil del usuario (datos, direcciones, compras, seguridad)
│   ├── dashboard/    # Panel de gestión (dueno y superadmin)
│   └── ...           # login, registro, promociones, search-result, etc.
├── component/        # Componentes reutilizables por dominio
│   ├── cart/         # CartPageClient, CheckoutStepper, formularios de checkout
│   ├── layout/       # Navbar, BarraBusqueda, CategoriasMenu, etc.
│   ├── dashboard/    # TablaEntidad, formularios CRUD
│   └── ...
├── context/          # AuthContext y CartContext (adaptadores de Redux)
├── lib/              # apiFetch, DTOs del cliente, clientes SSR
└── store/            # Redux Toolkit — authSlice, cartSlice, middleware
```

---

## Rutas

| URL | Descripción |
|-----|-------------|
| `/` | Home |
| `/login` | Inicio de sesión |
| `/registro` | Registro |
| `/recuperar-contrasena` | Reset de contraseña por email |
| `/search-result` | Resultados de búsqueda |
| `/product-detail-page/[id]` | Detalle de producto |
| `/promociones` | Listado de promociones |
| `/promociones/[id]` | Detalle de promoción |
| `/carrito` | Carrito + flujo de checkout (envío → pago → confirmación) |
| `/perfil` | Perfil del usuario — tabs: datos, direcciones, compras, seguridad |
| `/quienes-somos` | Información del equipo |
| `/dashboard` | Panel de gestión (requiere rol `dueno` o `superadmin`) |

---

## Arquitectura de estado

El estado global usa **Redux Toolkit**. Los contextos `AuthContext` y `CartContext` son adaptadores que exponen una API estable sobre el store.

- **Access token**: en memoria (variable de módulo en `lib/api.ts`).
- **Refresh token**: en `localStorage` bajo la clave `techpoint:refresh_token`.
- **Carrito**: persistido en `localStorage` bajo `techpoint:cart:{userId}` (logueado) o `techpoint:cart:guest`.

## Rewrites

`next.config.ts` redirige `/api/:path*` → `http://localhost:4000/api/:path*`. Las API Routes en `app/api/` toman precedencia para sus paths exactos (proxies del dashboard, wrapping de productos y promociones para SSR).
