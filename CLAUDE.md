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
- **nodemailer** — envío de emails transaccionales via SMTP (reset de contraseña y cambio de contraseña con código)
- **multer** — subida de imágenes (slides del home; almacenadas como base64 en MongoDB)

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
- Flujo de cambio de contraseña desde el perfil (modelo `PasswordChangeChallenge`): el usuario pide el cambio → recibe código de 6 dígitos por email → confirma con el código. TTL automático via MongoDB. Endpoints: `POST /api/auth/password/change/request` y `POST /api/auth/password/change/confirm`

**RBAC dinámico:**
- `User` → muchos `Role` (ObjectId[])
- `Role` → muchos `Permission` (ObjectId[])
- `Permission` → `{ nombre, recurso, accion }` (entidad en BD, no hardcodeada)
- Tres roles estándar: `superadmin` (acceso total), `dueno` (gestión de catálogo, promociones y slides), `usuario` (compras)
- `verificarSuperAdmin` — middleware para rutas exclusivas de superadmin (users, roles, permisos)
- `verificarRoles(...roles)` — factory genérico para rutas accesibles por varios roles

## Estructura del server

```
server/src/
├── config/
│   ├── constants.ts       # ROL_SUPERADMIN, ROL_DUENO, ROL_USUARIO
│   ├── database.ts        # conexión MongoDB via MONGODB_URI
│   ├── env.ts             # validación de variables de entorno requeridas (lanza error si faltan)
│   ├── logger.ts          # logging estructurado JSON con niveles
│   └── multer.ts          # configuración de Multer (memoria, filtro imagen, límite 5MB)
├── models/                # esquemas Mongoose + interfaces TypeScript
│   ├── User.ts            # IUser — hashing de contraseña, validación
│   ├── Role.ts            # IRole — agrupa permisos
│   ├── Permission.ts      # IPermission — {nombre, recurso, accion}
│   ├── Item.ts            # IItem — productos con precio, stock, categorías
│   ├── Category.ts        # ICategory — agrupa ítems
│   ├── Promotion.ts       # IPromotion — promociones con descuento, fechas y categorías
│   ├── purchaseOrder.ts   # IPurchaseOrder — cabecera de orden
│   ├── purchaseOrderDetail.ts  # IPurchaseOrderDetail — línea de orden (monto auto)
│   ├── paymentMethod.ts   # IPaymentMethod — métodos de pago
│   ├── RefreshToken.ts    # IRefreshToken — tokens con TTL
│   ├── PasswordResetToken.ts   # IPasswordResetToken — reset con TTL 1h
│   ├── PasswordChangeChallenge.ts  # IPasswordChangeChallenge — cambio de password con código por email, TTL automático
│   ├── Address.ts         # IAddress — direcciones postales del usuario (soft delete)
│   └── Slide.ts           # ISlide — slides del home (imagen base64 en BD, soft delete)
├── controllers/           # handlers HTTP
│   ├── authController.ts        # register, login, refresh, logout, forgot/reset password, cambio de password con código
│   ├── userController.ts        # perfil, listar, obtener, crear, actualizar, eliminar
│   ├── roleController.ts        # listar, obtener (solo lectura)
│   ├── permissionController.ts  # listar, obtener (solo lectura)
│   ├── productController.ts     # CRUD de ítems
│   ├── categoryController.ts    # CRUD de categorías
│   ├── promotionController.ts   # CRUD de promociones
│   ├── cartController.ts        # validar carrito, checkout
│   ├── addressController.ts     # listar/eliminar direcciones propias del usuario
│   ├── orderController.ts       # listar órdenes propias; listado global para superadmin
│   └── slideController.ts       # CRUD de slides + subida de imagen
├── services/
│   ├── rbac/              # capa de lógica de negocio
│   │   ├── user.service.ts
│   │   ├── product.service.ts
│   │   ├── category.service.ts
│   │   ├── promotion.service.ts
│   │   ├── cart.service.ts          # validateCart (sin persistir), checkout atómico
│   │   ├── role.service.ts
│   │   ├── permission.service.ts
│   │   ├── address.service.ts       # listar/crear/eliminar direcciones por usuario
│   │   ├── order.service.ts         # obtener órdenes propias y detalle; listado global
│   │   ├── slide.service.ts         # CRUD slides (imagen base64)
│   │   └── *.interface.ts           # contratos de servicio
│   └── email/
│       └── emailService.ts    # envío de emails via nodemailer/SMTP
├── routes/                # routers Express
│   ├── authRoutes.ts      # rate-limit independiente por operación; incluye rutas de cambio de password
│   ├── userRoutes.ts      # auth + superadmin; /me con validación Zod
│   ├── roleRoutes.ts      # auth + superadmin, solo lectura
│   ├── permissionRoutes.ts # auth + superadmin, solo lectura
│   ├── productRoutes.ts   # GET público, mutaciones superadmin o dueño
│   ├── categoryRoutes.ts  # GET público, mutaciones superadmin o dueño
│   ├── promotionRoutes.ts # GET público, mutaciones superadmin o dueño
│   ├── cartRoutes.ts      # /payment-methods público; /validate público; /checkout auth
│   ├── addressRoutes.ts   # auth requerido; solo opera sobre direcciones propias (GET /me, DELETE /:id)
│   ├── orderRoutes.ts     # /me auth; / y /:id superadmin
│   └── slideRoutes.ts     # GET público; mutaciones superadmin o dueño; POST /imagen con multer
├── middlewares/
│   ├── auth.ts                 # verificarToken — valida JWT
│   ├── verificarSuperAdmin.ts  # verifica rol superadmin (users, roles, permisos)
│   ├── verificarRoles.ts       # factory verificarRoles(...roles) — productos, categorías, promociones, slides
│   ├── validar.ts              # middleware de validación Zod (envuelve schemas)
│   └── errorHandler.ts         # manejo global: Mongoose, JWT, duplicados
├── schemas/               # schemas Zod para validación de entrada
│   ├── auth.schemas.ts    # incluye CambiarPasswordRequestSchema y CambiarPasswordConfirmSchema
│   ├── cart.schemas.ts
│   ├── product.schemas.ts
│   ├── slide.schemas.ts
│   └── user.schemas.ts    # ActualizarPerfilSchema
├── types/
│   ├── index.ts           # JwtPayload, LoginInput, RegisterInput, AuthResponse…
│   ├── item.dtos.ts
│   ├── categories.dto.ts
│   ├── promotion.dtos.ts
│   ├── address.dtos.ts    # AddressResponseDto, CrearAddressDto
│   ├── slide.dtos.ts      # SlideResponse, CrearSlideDto, ActualizarSlideDto
│   └── rbac/              # DTOs de carrito, órdenes e interfaces de servicios
│       ├── cart.dtos.ts
│       ├── cart.service.interface.ts
│       ├── order.dtos.ts
│       ├── order.service.interface.ts
│       └── *.interface.ts
├── utils/
│   ├── descuentos.ts           # cálculo de descuentos en cascada (ítem + orden)
│   └── calculadoraPromocion.ts # aplicación de promociones a ítems
├── seeders/
│   ├── seed.ts            # SuperAdmin + roles/permisos iniciales
│   ├── seedProducts.ts    # catálogo inicial de productos
│   ├── seedPromotions.ts  # promociones iniciales
│   └── seedAddresses.ts   # direcciones de ejemplo para el SuperAdmin
├── __tests__/
│   ├── unit/              # pruebas unitarias (validación de carrito, descuentos)
│   └── integration/       # pruebas de integración (auth, checkout, productos)
├── app.ts                 # factory de la app Express (importable en tests); monta todas las rutas
└── index.ts               # entry point: conecta DB, arranca servidor
```

## Estructura del client

```
client/front-tpi/src/
├── app/                             # Next.js App Router
│   ├── layout.tsx                   # RootLayout: AuthProvider > CartProvider > Navbar + CartToast + CartDrawer + ConflictoCarritoModal
│   ├── page.tsx                     # Home — slider hero (SSR desde /api/slides) + productos destacados (SSR)
│   ├── globals.css
│   ├── api/                         # API routes Next.js (proxies al backend)
│   │   ├── products/route.ts        # proxy GET → backend /api/products (solo GET; envuelve en { success, products })
│   │   ├── promotions/route.ts      # proxy GET → backend /api/promotions (solo GET; envuelve en { success, promociones })
│   │   └── dashboard/
│   │       ├── _helpers.ts          # proxyA() — helper compartido para proxies transparentes del dashboard
│   │       ├── products/route.ts    # proxy transparente → /api/products (GET paginado + POST + PUT + DELETE)
│   │       ├── categories/route.ts  # proxy → /api/categories (GET + POST + PUT + DELETE)
│   │       ├── promotions/route.ts  # proxy → /api/promotions (GET + POST + PUT + DELETE)
│   │       └── slides/             # proxy → /api/slides (GET + POST /imagen + PUT + DELETE)
│   ├── carrito/page.tsx             # Página del carrito (envuelve CartPageClient)
│   ├── login/page.tsx               # Página de inicio de sesión
│   ├── registro/page.tsx            # Página de registro de usuario
│   ├── recuperar-contrasena/page.tsx # Solicitud de reset de contraseña
│   ├── quienes-somos/page.tsx       # Página estática "Quiénes somos"
│   ├── perfil/page.tsx              # Perfil del usuario con 4 tabs (requiere auth)
│   │   ├── _components/             # DatosPersonalesSeccion, DireccionesSeccion, ComprasSeccion, SeguridadSeccion, PerfilTabs, TarjetaDireccion, CompraCard, CompraDetalle
│   │   ├── _hooks/                  # useActualizarPerfil, useCambioPassword, useCompras, useDirecciones, useOrdenDetalle
│   │   └── _types.ts                # PerfilTab, Direccion
│   ├── product-detail-page/[id]/    # PDP dinámica
│   │   ├── page.tsx
│   │   ├── _components/             # HeroProducto, PanelInfo, SelectorCantidad, Accordion, RelatedSlider, Comparador
│   │   └── _hooks/                  # useProducto, useRelacionados
│   ├── promociones/
│   │   ├── page.tsx                 # Listado de promociones activas
│   │   └── [id]/page.tsx            # Detalle de promoción
│   ├── search-result/page.tsx       # Resultados de búsqueda (texto + categoría)
│   └── dashboard/                   # Panel de gestión para roles `dueno` y `superadmin`
│       ├── layout.tsx               # Auth guard (dueno + superadmin) + DashboardSidebar
│       ├── page.tsx                 # Redirect → /dashboard/productos
│       ├── productos/               # Lista paginada + formulario create/edit
│       ├── categorias/              # Lista + formulario create/edit
│       ├── promociones/             # Lista + formulario create/edit (parámetros dinámicos)
│       └── slider/                  # Lista de slides + formulario create/edit + subida de imagen
│           ├── page.tsx             # Tabla de slides con CRUD
│           ├── nuevo/page.tsx       # Alta de slide nuevo
│           └── [id]/editar/page.tsx # Edición de slide existente
├── component/
│   ├── card/card.tsx                # CardProduct — tarjeta de producto para grillas
│   ├── cart/                        # Componentes del carrito y checkout
│   │   ├── CartIcon.tsx             # Ícono con badge en la navbar
│   │   ├── CartDrawer.tsx           # Mini-carrito lateral
│   │   ├── CartAddedDrawer.tsx      # Drawer de confirmación post-agregar
│   │   ├── CartPageClient.tsx       # Flujo completo: carrito → envío → pago → confirmación
│   │   ├── CartItemRow.tsx          # Fila individual de ítem
│   │   ├── CartToast.tsx            # Toast de confirmación (auto-cierre 4s)
│   │   ├── CheckoutStepper.tsx      # Stepper visual (Carrito → Datos de envío → Pago)
│   │   ├── CheckoutEnvioForm.tsx    # Formulario de datos de envío (dirección guardada o nueva)
│   │   ├── CheckoutPagoForm.tsx     # Formulario de pago con tarjeta (marca + últimos 4)
│   │   ├── ConflictoCarritoModal.tsx # Modal para resolver conflicto carrito guest vs. usuario
│   │   ├── LoginGateModal.tsx       # Modal de login inline
│   │   ├── ConfirmDialog.tsx        # Diálogo de confirmación reutilizable
│   │   ├── hooks/useValidacionCarrito.ts  # Dispara validarCarrito thunk con debounce
│   │   └── _components/             # OpcionCarrito, FormularioDireccion, CamposContacto, SelectorDireccionGuardada
│   ├── layout/                      # Componentes de navegación
│   │   ├── navbar.tsx               # Cabecera principal
│   │   ├── Breadcrumb.tsx
│   │   ├── BarraBusqueda.tsx
│   │   ├── CategoriasMenu.tsx
│   │   ├── MenuMovilDrawer.tsx      # Navegación mobile
│   │   └── hooks/useCategorias.ts   # Hook SSR/cliente para cargar categorías
│   ├── promociones/
│   │   ├── CardPromocion.tsx        # Tarjeta de promoción
│   │   ├── ListaPromociones.tsx     # Grilla de promociones
│   │   └── usePromociones.ts        # Hook cliente para cargar promociones
│   ├── slider/Slider.tsx            # Carrusel de imágenes hero
│   ├── vitrina/VitrinaProductos.tsx # Grilla de productos con paginación
│   ├── busqueda/                    # ListaResultadosProductos + useResultadosBusqueda
│   └── dashboard/
│       ├── DashboardSidebar.tsx         # Sidebar con links a las 4 entidades gestionables
│       ├── TablaEntidad.tsx             # Tabla genérica: cabecera + grilla paginada + acciones
│       ├── FormularioProducto.tsx       # Formulario create/edit de productos (multi-select categorías)
│       ├── FormularioCategoria.tsx      # Formulario create/edit de categorías
│       ├── FormularioPromocion.tsx      # Formulario create/edit de promociones (parámetros según tipo)
│       └── FormularioSlide.tsx          # Formulario create/edit de slides (preview + subida de imagen)
├── context/
│   ├── AuthContext.tsx              # Adapter Redux: login, logout, registrar, solicitarReset, resetearPassword, tienePermiso, tieneRol, esSuperAdmin
│   └── CartContext.tsx              # Adapter Redux: agregar, quitar, actualizarCantidad, vaciar, abrirDrawer, cerrarDrawer, subtotalEstimado
├── store/
│   ├── index.ts                     # configureStore + tipos RootState / AppDispatch
│   ├── authSlice.ts                 # Estado auth: usuario, isAutenticado, isCargando
│   ├── cartSlice.ts                 # Estado carrito: items, hidratado, ultimoAgregado, drawerAbierto, validacion, conflictoLogin
│   ├── hooks.ts                     # useAppDispatch, useAppSelector tipados
│   └── localStorageMiddleware.ts    # Persiste carrito en 'techpoint:cart:{userId}' o 'techpoint:cart:guest' (solo cuando hidratado=true y sin conflicto activo)
└── lib/
    ├── api.ts                       # apiFetch con header Authorization automático + clase ApiError
    ├── cart-types.ts                # DTOs del carrito (CartItem, ValidarCarritoDto, CheckoutDto, DatosEnvioDto, DatosTarjetaDto, etc.)
    ├── order-types.ts               # DTOs de órdenes (OrdenResumen, OrdenDetalle, DetalleOrden, OrdenEnvio)
    ├── dashboard-types.ts           # Tipos del dashboard (ProductoDashboard, SlideDashboard, CategoriaResumen, etc.)
    ├── productos.ts                 # obtenerProductos — cliente SSR para el backend
    ├── promociones.ts               # obtenerPromociones — cliente SSR para el backend
    └── slides.ts                    # obtenerSlides — cliente SSR para /api/slides (no cachear)
```

**Estado actual del frontend:**
- Auth implementada: login, logout, registro, hidratación desde localStorage, refresh automático (14 min)
- Carrito implementado: Redux + persistencia por usuario/guest, validación contra backend, drawer y toast
- **Checkout implementado**: flujo completo por pasos en `CartPageClient` (carrito → envío → pago → confirmación)
- Conflicto de carrito implementado: modal para elegir entre carrito guest y carrito de sesión anterior
- Promociones implementadas: listado y detalle (SSR)
- Perfil implementado con 4 tabs: datos personales, mis direcciones, mis compras (historial de órdenes), seguridad (cambio de contraseña con código por email)
- Reset de contraseña implementado: página de solicitud conectada al backend via nodemailer/SMTP
- Dashboard implementado para `dueno` y `superadmin`: CRUD de productos, categorías, promociones y **slides del home**
- Sin páginas standalone de: confirmación de compra post-checkout (se muestra inline en `CartPageClient`)

**Patrones del frontend:**
- Patrón adaptador: `AuthContext` y `CartContext` exponen una API estable y por dentro usan Redux
- Server Components para carga inicial de productos, promociones y slides (SSR); hooks de cliente para filtrado/búsqueda
- `next.config.ts` tiene un rewrite catch-all `/api/:path*` → Express. Las API routes en `app/api/` toman precedencia para sus paths exactos. Para el dashboard se usan rutas en `app/api/dashboard/` como proxies transparentes con el helper `_helpers.ts`
- Access token en memoria; refresh token en `localStorage` bajo la clave `techpoint:refresh_token`
- Carrito escopado por usuario: key `techpoint:cart:{userId}` logueado, `techpoint:cart:guest` sin sesión

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/password/change/request  (auth) — inicia cambio de password con código por email
POST   /api/auth/password/change/confirm  (auth) — confirma cambio con código de 6 dígitos

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

GET    /api/cart/payment-methods  (público) — lista métodos de pago activos
POST   /api/cart/validate     (público) — verifica precios y stock sin persistir
POST   /api/cart/checkout     (auth) — decremento atómico de stock + crea orden + guarda dirección/teléfono

GET    /api/addresses/me      (auth) — lista direcciones del usuario autenticado
DELETE /api/addresses/:id     (auth) — soft delete de dirección propia

GET    /api/orders/me         (auth) — lista órdenes del usuario autenticado
GET    /api/orders/me/:id     (auth) — detalle de una orden propia
GET    /api/orders            (superadmin) — listado global de órdenes
GET    /api/orders/:id        (superadmin) — detalle de cualquier orden

GET    /api/slides            (público) — slides activos del home, ordenados por `orden` ASC
GET    /api/slides/:id        (público)
POST   /api/slides/imagen     (superadmin o dueño) — sube imagen via multer, devuelve data URI base64
POST   /api/slides            (superadmin o dueño)
PUT    /api/slides/:id        (superadmin o dueño)
DELETE /api/slides/:id        (superadmin o dueño — soft delete)
```

## Flujo de carrito y órdenes

1. `CartService.validateCart()` valida precios y stock sin persistir
2. `CartService.checkout()` decrementa stock atómicamente con rollback ante fallo; persiste la orden con snapshot de envío y tarjeta
3. El checkout en el frontend pasa por 3 pasos: carrito → datos de envío → pago; al confirmar llama a `POST /api/cart/checkout`
4. `PurchaseOrderDetail.monto` y `PurchaseOrder.montoTotal` se calculan en hooks `pre-save`
5. Descuentos en cascada a nivel ítem y orden (0–100%)
6. `calculadoraPromocion.ts` aplica promociones activas a los ítems del carrito

## Variables de entorno (server/.env)

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/programacion4
JWT_SECRET=cambiar_por_clave_secreta_segura
SUPERADMIN_PASSWORD=contraseña_superadmin_segura
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGIN=http://localhost:3000

# SMTP (Gmail con app password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-gmail@gmail.com
SMTP_PASSWORD=la-app-password-de-16-chars-sin-espacios
EMAIL_FROM=TechPoint <tu-gmail@gmail.com>
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
npm run seed:addresses  # carga direcciones de ejemplo para el SuperAdmin
npm test                # ejecuta todos los tests
npm run test:unit       # solo tests unitarios
npm run test:integration # solo tests de integración
npm run test:coverage   # tests con reporte de cobertura

# Client
cd client/front-tpi && npm install
npm run dev             # Next.js dev server en http://localhost:3000
npm run build           # build de producción
npm start               # sirve el build de producción
npm run lint            # ESLint
```
