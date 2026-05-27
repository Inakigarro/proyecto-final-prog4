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
- **bcryptjs**, **Helmet**, **CORS**, **rate-limiting**

**Frontend (`client/front-tpi/`):**
- **Next.js** — framework React con App Router
- **React** + **TypeScript 5** — UI
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
- Flujo de reset de contraseña con token de 1h (modelo `PasswordResetToken`)

**RBAC dinámico:**
- `User` → muchos `Role` (ObjectId[])
- `Role` → muchos `Permission` (ObjectId[])
- `Permission` → `{ nombre, recurso, accion }` (entidad en BD, no hardcodeada)
- Middleware `verificarSuperAdmin` verifica que el usuario tenga el rol `superadmin`

## Estructura del server

```
server/src/
├── config/
│   ├── constants.ts       # ROL_SUPERADMIN, ROL_USUARIO
│   ├── database.ts        # conexión MongoDB via MONGODB_URI
│   └── logger.ts          # logging estructurado JSON con niveles
├── models/                # esquemas Mongoose + interfaces TypeScript
│   ├── User.ts            # IUser — hashing de contraseña, validación
│   ├── Role.ts            # IRole — agrupa permisos
│   ├── Permission.ts      # IPermission — {nombre, recurso, accion}
│   ├── Item.ts            # IItem — productos con precio, stock, categorías
│   ├── Category.ts        # ICategory — agrupa ítems
│   ├── PurchaseOrder.ts   # IPurchaseOrder — cabecera de orden
│   ├── PurchaseOrderDetail.ts  # IPurchaseOrderDetail — línea de orden (monto auto)
│   ├── PaymentMethod.ts   # IPaymentMethod — métodos de pago
│   ├── RefreshToken.ts    # IRefreshToken — tokens con TTL
│   └── PasswordResetToken.ts   # IPasswordResetToken — reset con TTL 1h
├── controllers/           # handlers HTTP
│   ├── authController.ts  # register, login, refresh, logout, forgot/reset password
│   ├── userController.ts  # perfil, listar, obtener, crear, actualizar, eliminar
│   ├── roleController.ts  # listar, obtener (solo lectura)
│   ├── permissionController.ts # listar, obtener (solo lectura)
│   ├── productController.ts    # CRUD de ítems
│   ├── categoryController.ts   # CRUD de categorías
│   └── cartController.ts  # validar carrito, checkout
├── services/rbac/         # capa de lógica de negocio
│   ├── user.service.ts
│   ├── product.service.ts
│   ├── category.service.ts
│   ├── cart.service.ts    # validateCart (sin persistir), checkout atómico
│   ├── role.service.ts
│   ├── permission.service.ts
│   └── *.interface.ts     # contratos de servicio
├── routes/                # routers Express
│   ├── authRoutes.ts      # rate-limit: 10 intentos / 15min
│   ├── userRoutes.ts      # auth + superadmin
│   ├── roleRoutes.ts      # auth + superadmin, solo lectura
│   ├── permissionRoutes.ts # auth + superadmin, solo lectura
│   ├── productRoutes.ts   # GET público, mutaciones auth
│   ├── categoryRoutes.ts  # GET público, mutaciones superadmin
│   └── cartRoutes.ts      # auth requerido
├── middlewares/
│   ├── auth.ts            # verificarToken — valida JWT
│   ├── verificarSuperAdmin.ts  # verifica rol superadmin
│   └── errorHandler.ts    # manejo global: Mongoose, JWT, duplicados
├── types/
│   ├── index.ts           # JwtPayload, LoginInput, RegisterInput, AuthResponse…
│   ├── item.dtos.ts
│   ├── categories.dto.ts
│   └── rbac/              # DTOs de carrito e interfaces de servicios
├── seeders/
│   ├── seed.ts            # SuperAdmin + roles/permisos iniciales
│   └── seedProducts.ts    # catálogo inicial de productos
└── index.ts               # entry point: app Express, middlewares, rutas
```

## Estructura del client

```
client/front-tpi/src/
├── app/
│   ├── layout.tsx         # RootLayout con Navbar
│   ├── page.tsx           # Home — lista de productos
│   ├── globals.css
│   ├── api/
│   │   ├── products/route.ts       # proxy GET → backend /api/products
│   │   └── test-connection/route.ts
│   └── test-connection/page.tsx
└── component/
    └── layout/
        ├── navbar.tsx     # navegación principal
        ├── navbar.css
        └── card/
            ├── card.tsx   # CardProduct — precio, descripción, CTA
            └── card.css
```

**Notas del frontend:**
- Usa Next.js App Router (no Pages Router)
- Las API routes de Next.js proxean al backend para evitar CORS en dev
- Auth, carrito, checkout y páginas de usuario aún no implementados

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

GET    /api/users/me          (auth)
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
POST   /api/products          (auth)
PUT    /api/products/:id      (auth)
DELETE /api/products/:id      (auth — soft delete)

GET    /api/categories        (público)
GET    /api/categories/:id    (público)
POST   /api/categories        (superadmin)
PUT    /api/categories/:id    (superadmin)
DELETE /api/categories/:id    (superadmin — soft delete)

POST   /api/cart/validate     (auth) — verifica stock sin persistir
POST   /api/cart/checkout     (auth) — decremento atómico de stock + crea orden
```

## Flujo de carrito y órdenes

1. `CartService.validateCart()` valida precios y stock sin persistir
2. `CartService.checkout()` decrementa stock atómicamente con rollback ante fallo
3. `PurchaseOrderDetail.monto` y `PurchaseOrder.montoTotal` se calculan en hooks `pre-save`
4. Descuentos en cascada a nivel ítem y orden (0–100%)

## Variables de entorno (server/.env)

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/programacion4
JWT_SECRET=cambiar_por_clave_secreta_segura
SUPERADMIN_PASSWORD=contraseña_superadmin_segura
```

## Comandos

```bash
# Server
cd server && npm install
npm run dev           # ts-node + nodemon (watch mode)
npm run build         # compila TypeScript a /dist
npm start             # producción desde /dist
npm run seed          # carga SuperAdmin y permisos iniciales
npm run seed:products # carga catálogo inicial de productos

# Client
cd client/front-tpi && npm install
npm run dev           # Next.js dev server en http://localhost:3000
npm run build         # build de producción
npm start             # sirve el build de producción
npm run lint          # ESLint
```
