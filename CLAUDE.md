# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Aplicación web e-commerce completa desarrollada como proyecto del curso Programacion 4 (Tecnicatura en Programación). Plataforma tipo TechPoint con catálogo de productos, carrito, órdenes de compra y RBAC.

**Equipo:** Iñaki Garro, Franco Armando, Rocío Medina, Natalia Medina, Juan Pedro Caffa.

## Stack

**Backend (`server/`):**
- **MongoDB Atlas** + **Mongoose 8** — base de datos, enfoque code-first
- **Express 4** — API REST
- **Node.js** + **TypeScript 5** — runtime y lenguaje
- **JWT** — autenticación stateless (access 15m + refresh 30d)
- **bcryptjs**, **Helmet**, **CORS**, **rate-limiting**, **Zod**
- **nodemailer** — envío de emails transaccionales via SMTP (reset de contraseña)

**Frontend (`client/front-tpi/`):**
- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Redux Toolkit 2** — gestión de estado global
- CSS Modules — estilos por componente

## Convenciones de código

- Comentarios en funciones y clases: **cortos, descriptivos y directos**
- Tipar siempre parámetros, retornos e interfaces
- Código y comentarios en **español**

## Arquitectura

**Estructura:** Monorepo con `/server` (backend Express) y `/client/front-tpi` (frontend Next.js) como subproyectos independientes.

**Package manager:** npm

**Autenticación JWT:**
- `register` crea el usuario con rol `usuario` en una transacción
- `login` genera access token (15m) + refresh token (30d almacenado en BD)
- Refresh token rotation: cada renovación invalida el anterior
- `logout` revoca el refresh token de la BD
- Flujo de reset de contraseña con token de 1h (modelo `PasswordResetToken`); email enviado via nodemailer/SMTP

**RBAC dinámico:**
- `User` → muchos `Role` (ObjectId[])
- `Role` → muchos `Permission` (ObjectId[])
- `Permission` → `{ nombre, recurso, accion }` (entidad en BD, no hardcodeada)
- Tres roles estándar: `superadmin` (acceso total), `dueno` (gestión de catálogo y promociones), `usuario` (compras)
- `verificarSuperAdmin` — middleware para rutas exclusivas de superadmin (users, roles, permisos)
- `verificarRoles(...roles)` — factory genérico para rutas accesibles por varios roles

## Estructura del server

```
server/src/
├── config/
│   ├── constants.ts       # ROL_SUPERADMIN, ROL_DUENO, ROL_USUARIO
│   ├── database.ts        # conexión MongoDB via MONGODB_URI
│   ├── env.ts             # validación de variables de entorno requeridas (lanza error si faltan)
│   └── logger.ts          # logging estructurado JSON con niveles
├── models/                # esquemas Mongoose + interfaces TypeScript
│   ├── User.ts            # IUser — hashing de contraseña, validación
│   ├── Role.ts            # IRole — agrupa permisos
│   ├── Permission.ts      # IPermission — {nombre, recurso, accion}
│   ├── Item.ts            # IItem — productos con precio, stock, categorías
│   ├── Category.ts        # ICategory — agrupa ítems
│   ├── Promotion.ts       # IPromotion — promociones con descuento, fechas y categorías
│   ├── PurchaseOrder.ts   # IPurchaseOrder — cabecera de orden
│   ├── PurchaseOrderDetail.ts  # IPurchaseOrderDetail — línea de orden (monto auto)
│   ├── PaymentMethod.ts   # IPaymentMethod — métodos de pago
│   ├── RefreshToken.ts    # IRefreshToken — tokens con TTL
│   └── PasswordResetToken.ts   # IPasswordResetToken — reset con TTL 1h
├── controllers/           # handlers HTTP
│   ├── authController.ts        # register, login, refresh, logout, forgot/reset password
│   ├── userController.ts        # perfil, listar, obtener, crear, actualizar, eliminar
│   ├── roleController.ts        # listar, obtener (solo lectura)
│   ├── permissionController.ts  # listar, obtener (solo lectura)
│   ├── productController.ts     # CRUD de ítems
│   ├── categoryController.ts    # CRUD de categorías
│   ├── promotionController.ts   # CRUD de promociones
│   └── cartController.ts        # validar carrito, checkout
├── services/
│   ├── rbac/              # capa de lógica de negocio
│   │   ├── user.service.ts
│   │   ├── product.service.ts
│   │   ├── category.service.ts
│   │   ├── promotion.service.ts
│   │   ├── cart.service.ts    # validateCart (sin persistir), checkout atómico
│   │   ├── role.service.ts
│   │   ├── permission.service.ts
│   │   └── *.interface.ts     # contratos de servicio
│   └── email/
│       └── emailService.ts    # envío de emails via nodemailer/SMTP
├── routes/                # routers Express
│   ├── authRoutes.ts      # rate-limit: 10 intentos / 15min
│   ├── userRoutes.ts      # auth + superadmin
│   ├── roleRoutes.ts      # auth + superadmin, solo lectura
│   ├── permissionRoutes.ts # auth + superadmin, solo lectura
│   ├── productRoutes.ts   # GET público, mutaciones superadmin o dueño
│   ├── categoryRoutes.ts  # GET público, mutaciones superadmin o dueño
│   ├── promotionRoutes.ts # GET público, mutaciones superadmin o dueño
│   └── cartRoutes.ts      # auth requerido
├── middlewares/
│   ├── auth.ts                 # verificarToken — valida JWT
│   ├── verificarSuperAdmin.ts  # verifica rol superadmin (users, roles, permisos)
│   ├── verificarRoles.ts       # factory verificarRoles(...roles) — productos, categorías, promociones
│   ├── validar.ts              # middleware de validación Zod (envuelve schemas)
│   └── errorHandler.ts         # manejo global: Mongoose, JWT, duplicados
├── schemas/               # schemas Zod para validación de entrada
│   ├── auth.schemas.ts
│   ├── cart.schemas.ts
│   └── product.schemas.ts
├── types/
│   ├── index.ts           # JwtPayload, LoginInput, RegisterInput, AuthResponse…
│   ├── item.dtos.ts
│   ├── categories.dto.ts
│   ├── promotion.dtos.ts
│   └── rbac/              # DTOs de carrito e interfaces de servicios
├── utils/
│   ├── descuentos.ts           # cálculo de descuentos en cascada (ítem + orden)
│   └── calculadoraPromocion.ts # aplicación de promociones a ítems
├── seeders/
│   ├── seed.ts            # SuperAdmin + roles/permisos iniciales
│   ├── seedProducts.ts    # catálogo inicial de productos
│   └── seedPromotions.ts  # promociones iniciales
├── __tests__/
│   ├── unit/              # pruebas unitarias (validación de carrito, descuentos)
│   └── integration/       # pruebas de integración (auth, checkout, productos)
├── app.ts                 # factory de la app Express (importable en tests)
└── index.ts               # entry point: conecta DB, arranca servidor
```

## Estructura del client

```
client/front-tpi/src/
├── app/                             # Next.js App Router
│   ├── layout.tsx                   # RootLayout: AuthProvider > CartProvider > Navbar + modales globales
│   ├── page.tsx                     # Home — slider hero + productos destacados (SSR)
│   ├── globals.css
│   ├── api/                         # API routes Next.js (proxies al backend)
│   │   ├── products/route.ts        # proxy GET → backend /api/products (usado por SSR)
│   │   ├── promotions/route.ts      # proxy GET → backend /api/promotions (usado por SSR)
│   │   ├── dashboard/products/route.ts  # proxy transparente → /api/products (GET paginado + POST)
│   │   ├── dashboard/categories/route.ts # proxy → /api/categories (GET + POST)
│   │   ├── dashboard/promotions/route.ts # proxy → /api/promotions (GET + POST)
│   │   └── test-connection/route.ts
│   ├── carrito/page.tsx             # Página del carrito
│   ├── login/page.tsx               # Página de inicio de sesión
│   ├── registro/page.tsx            # Página de registro de usuario
│   ├── recuperar-contrasena/page.tsx # Solicitud de reset de contraseña
│   ├── perfil/page.tsx              # Perfil de usuario (requiere auth)
│   ├── product-detail-page/[id]/    # PDP dinámica
│   │   ├── page.tsx
│   │   ├── _components/             # HeroProducto, PanelInfo, SelectorCantidad, Accordion, RelatedSlider, Comparador
│   │   └── _hooks/                  # useProducto, useRelacionados
│   ├── promociones/
│   │   ├── page.tsx                 # Listado de promociones activas
│   │   └── [id]/page.tsx            # Detalle de promoción
│   ├── search-result/page.tsx       # Resultados de búsqueda (texto + categoría)
│   └── dashboard/                   # Panel de gestión exclusivo del rol `dueno`
│       ├── layout.tsx               # Auth guard + DashboardSidebar
│       ├── page.tsx                 # Redirect → /dashboard/productos
│       ├── productos/               # Lista paginada + formulario create/edit
│       ├── categorias/              # Lista + formulario create/edit
│       └── promociones/             # Lista + formulario create/edit (parámetros dinámicos)
├── component/
│   ├── card/card.tsx                # CardProduct — tarjeta de producto para grillas
│   ├── cart/                        # Componentes del carrito
│   │   ├── CartIcon.tsx             # Ícono con badge en la navbar
│   │   ├── CartDrawer.tsx           # Mini-carrito lateral
│   │   ├── CartAddedDrawer.tsx      # Drawer de confirmación post-agregar
│   │   ├── CartPageClient.tsx       # Página completa con validación + checkout (TODO: llamada checkout)
│   │   ├── CartItemRow.tsx          # Fila individual de ítem
│   │   ├── CartToast.tsx            # Toast de confirmación (auto-cierre 4s)
│   │   ├── LoginGateModal.tsx       # Modal de login (email + contraseña)
│   │   ├── ConfirmDialog.tsx        # Diálogo de confirmación reutilizable
│   │   └── useValidacionCarrito.ts  # Hook que dispara validarCarrito thunk con debounce
│   ├── layout/                      # Componentes de navegación
│   │   ├── navbar.tsx               # Cabecera principal
│   │   ├── Breadcrumb.tsx
│   │   ├── BarraBusqueda.tsx
│   │   ├── CategoriasMenu.tsx
│   │   ├── MenuMovilDrawer.tsx      # Navegación mobile
│   │   └── useCategorias.ts         # Hook SSR/cliente para cargar categorías
│   ├── promociones/
│   │   ├── CardPromocion.tsx        # Tarjeta de promoción
│   │   ├── ListaPromociones.tsx     # Grilla de promociones
│   │   └── usePromociones.ts        # Hook cliente para cargar promociones
│   ├── slider/Slider.tsx            # Carrusel de imágenes hero
│   ├── vitrina/VitrinaProductos.tsx # Grilla de productos con paginación
│   ├── busqueda/                    # ListaResultadosProductos + useResultadosBusqueda
│   └── dashboard/
│       ├── DashboardSidebar.tsx         # Sidebar con links a las 3 entidades gestionables
│       ├── TablaEntidad.tsx             # Tabla genérica: cabecera + grilla paginada + acciones
│       ├── FormularioProducto.tsx       # Formulario create/edit de productos (multi-select categorías)
│       ├── FormularioCategoria.tsx      # Formulario create/edit de categorías
│       └── FormularioPromocion.tsx      # Formulario create/edit de promociones (parámetros según tipo)
├── context/
│   ├── AuthContext.tsx              # Adapter Redux: login, logout, registrar, solicitarReset, resetearPassword, tienePermiso, tieneRol, esSuperAdmin
│   └── CartContext.tsx              # Adapter Redux: agregar, quitar, actualizarCantidad, vaciar, abrirDrawer, cerrarDrawer
├── store/
│   ├── index.ts                     # configureStore + tipos RootState / AppDispatch
│   ├── authSlice.ts                 # Estado auth: usuario, isAutenticado, isCargando
│   ├── cartSlice.ts                 # Estado carrito: items, ultimoAgregado, drawerAbierto, hidratado, validacion
│   ├── hooks.ts                     # useAppDispatch, useAppSelector tipados
│   └── localStorageMiddleware.ts    # Persiste el carrito en localStorage tras cada acción (solo cuando hidratado=true)
└── lib/
    ├── api.ts                       # apiFetch con header Authorization automático + clase ApiError
    ├── cart-types.ts                # DTOs del carrito (CartItem, ValidarCarritoDto, etc.)
    ├── productos.ts                 # obtenerProductos — cliente SSR para el backend
    └── promociones.ts               # obtenerPromociones — cliente SSR para el backend
```

**Estado actual del frontend:**
- Auth implementada: login, logout, registro, hidratación desde localStorage, refresh automático (14 min)
- Carrito implementado: Redux + persistencia, validación contra backend, drawer y toast
- Promociones implementadas: listado y detalle (SSR)
- Perfil implementado: ver y editar datos personales (`/perfil`)
- Reset de contraseña implementado: página de solicitud conectada al backend via nodemailer/SMTP
- Dashboard dueño implementado: CRUD de productos, categorías y promociones (`/dashboard`)
- Checkout **pendiente**: `CartPageClient.tsx` tiene el TODO en `handleConfirmarCompra`
- Sin páginas de: historial de órdenes (`/mis-ordenes`), confirmación de compra

**Patrones del frontend:**
- Patrón adaptador: `AuthContext` y `CartContext` exponen una API estable y por dentro usan Redux
- Server Components para carga inicial de productos y promociones (SSR); hooks de cliente para filtrado/búsqueda
- `next.config.ts` tiene un rewrite catch-all `/api/:path*` → Express. Las API routes en `app/api/` toman precedencia para sus paths exactos. Para el dashboard se usan rutas en `app/api/dashboard/` como proxies transparentes (evitan la interferencia de las rutas existentes de `products` y `promotions` que envuelven la respuesta)
- Access token en memoria; refresh token en `localStorage` bajo la clave `techpoint:refresh_token`

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

GET    /api/users/me          (auth)
PUT    /api/users/me          (auth) — actualiza nombre, apellido, email propios
GET    /api/users             (superadmin)
GET    /api/users/:id         (superadmin)
POST   /api/users             (superadmin)
PUT    /api/users/:id         (superadmin)
DELETE /api/users/:id         (superadmin — soft delete activo=false)

GET    /api/roles             (superadmin)
GET    /api/roles/:id
GET    /api/permissions       (superadmin)
GET    /api/permissions/:id

GET    /api/products          (público)
GET    /api/products/:id      (público)
POST   /api/products          (superadmin o dueño)
PUT    /api/products/:id      (superadmin o dueño)
DELETE /api/products/:id      (superadmin o dueño — soft delete)

GET    /api/categories        (público)
GET    /api/categories/:id    (público)
POST   /api/categories        (superadmin o dueño)
PUT    /api/categories/:id    (superadmin o dueño)
DELETE /api/categories/:id    (superadmin o dueño — soft delete)

GET    /api/promotions        (público)
GET    /api/promotions/:id    (público)
POST   /api/promotions        (superadmin o dueño)
PUT    /api/promotions/:id    (superadmin o dueño)
DELETE /api/promotions/:id    (superadmin o dueño — soft delete)

POST   /api/cart/validate     (auth) — verifica stock sin persistir
POST   /api/cart/checkout     (auth) — decremento atómico de stock + crea orden
```

## Flujo de carrito y órdenes

1. `CartService.validateCart()` valida precios y stock sin persistir
2. `CartService.checkout()` decrementa stock atómicamente con rollback ante fallo
3. `PurchaseOrderDetail.monto` y `PurchaseOrder.montoTotal` se calculan en hooks `pre-save`
4. Descuentos en cascada a nivel ítem y orden (0–100%)
5. `calculadoraPromocion.ts` aplica promociones activas a los ítems del carrito

## Variables de entorno (server/.env)

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/programacion4
JWT_SECRET=cambiar_por_clave_secreta_segura
SUPERADMIN_PASSWORD=contraseña_superadmin_segura
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGIN=http://localhost:3000
<<<<<<< HEAD

# SMTP (Brevo por defecto)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=el-login-smtp-que-te-da-brevo
SMTP_PASSWORD=la-smtp-key-de-brevo
EMAIL_FROM=TechPoint <noreply@tu-email-verificado.com>
=======
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-gmail@gmail.com
SMTP_PASSWORD=la-app-password-de-16-chars-sin-espacios
EMAIL_FROM=TechPoint <tu-gmail@gmail.com>
>>>>>>> master
```

## Comandos

```bash
# Server
cd server && npm install
npm run dev             # ts-node + nodemon (watch mode)
npm run build           # compila TypeScript a /dist
npm start               # producción desde /dist
npm run seed            # carga SuperAdmin y permisos iniciales
npm run seed:products   # carga catálogo inicial de productos
npm run seed:promotions # carga promociones iniciales
npm test                # ejecuta tests unitarios e integración

# Client
cd client/front-tpi && npm install
npm run dev             # Next.js dev server en http://localhost:3000
npm run build           # build de producción
npm start               # sirve el build de producción
npm run lint            # ESLint
```
