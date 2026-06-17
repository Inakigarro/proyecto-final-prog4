# ROADMAP — TPI Entrega Final

> Fecha de entrega: **18/06/2026** · Defensa: a coordinar
>
> Basado en la consigna oficial. Cada ítem marcado con ✅ ya está en `master` o en una rama mergeada.
> Los ítems ❌ son **bloqueantes para la entrega**. Los ⚠️ son observaciones a resolver.

---

## Backend

### Autenticación y autorización
- ✅ Registro de usuarios (`POST /api/auth/register`)
- ✅ Inicio de sesión (`POST /api/auth/login`)
- ✅ Encriptación de contraseñas (bcryptjs)
- ✅ Autenticación mediante JWT (access 15 min + refresh 30 días)
- ✅ Middleware de autenticación (`verificarToken`)
- ✅ Middleware de autorización por roles (`verificarSuperAdmin`)
- ✅ Middleware de autorización por roles múltiples (`verificarRoles(...roles)`)
- ✅ Recuperación de contraseña por email (nodemailer/SMTP) — solicitud, token temporal, restablecimiento
- ✅ Cambio de contraseña con código por email desde el perfil (`POST /api/auth/password/change/request` + `confirm`)
- ✅ Roles implementados: `usuario` (cliente), `superadmin` (administrador) y `dueno` (gestión de catálogo y slides)

### Gestión de productos
- ✅ Obtener productos (`GET /api/products`)
- ✅ Obtener producto por ID (`GET /api/products/:id`)
- ✅ Crear producto (`POST /api/products` — auth)
- ✅ Editar producto (`PUT /api/products/:id` — auth)
- ✅ Baja lógica (`DELETE /api/products/:id` — auth)
- ✅ Control de stock (campo `stock` en modelo `Item`, descuento atómico en checkout)

### Gestión de usuarios
- ✅ Consulta de perfil propio (`GET /api/users/me`)
- ✅ Edición de datos personales propios (`PUT /api/users/me` — nombre, apellido, email)
- ✅ Admin: listado de usuarios (`GET /api/users`)
- ✅ Admin: editar usuario (`PUT /api/users/:id`)
- ✅ Admin: baja lógica de usuario (`DELETE /api/users/:id` — soft delete `activo: false`)

### Gestión de carrito
- ✅ Agregar / modificar / eliminar / vaciar — gestionado en cliente (Redux + localStorage)
- ✅ Validación de stock y precios contra backend (`POST /api/cart/validate`)
- ✅ Checkout completo (`POST /api/cart/checkout`) — envío, tarjeta, email de confirmación
- ✅ Descuentos de promociones aplicados correctamente en el monto de cada `PurchaseOrderDetail` (bug corregido: antes se calculaba `precioUnitario × cantidad` ignorando las promos activas)
- ✅ Métodos de pago (`GET /api/cart/payment-methods`)
- ✅ Carrito scopeado por usuario en localStorage (`techpoint:cart:{userId}`)
- ⚠️ **No hay modelo `Carrito` persistido en MongoDB.** El TPI exige `Carrito` como modelo mínimo. El carrito actual vive solo en el cliente. Evaluar si el docente acepta esta arquitectura o si hay que agregar persistencia.

### Órdenes de compra
- ✅ Generación de orden (`POST /api/cart/checkout`) — descuento atómico de stock
- ✅ Asociación al usuario y persistencia de ítems comprados (modelos `PurchaseOrder` + `PurchaseOrderDetail`)
- ✅ Cálculo del total (hooks `pre-save` en los modelos + corrección por promociones en `cart.service.ts`)
- ✅ Email de confirmación de compra (nodemailer/SMTP)
- ✅ Cliente: consultar sus órdenes (`GET /api/orders/me`)
- ✅ Cliente: ver detalle de una orden (`GET /api/orders/me/:id`)
- ✅ Admin: ver todas las órdenes (`GET /api/orders`)
- ✅ Admin: ver detalle de cualquier orden (`GET /api/orders/:id`)

### Gestión de slides del home
- ✅ CRUD de slides (`GET/POST/PUT/DELETE /api/slides`)
- ✅ Subida de imagen (`POST /api/slides/imagen`) — multer, imagen almacenada como base64 en MongoDB
- ✅ Acceso: GET público; mutaciones requieren `superadmin` o `dueno`

### Gestión de direcciones
- ✅ Listar direcciones propias (`GET /api/addresses/me`)
- ✅ Baja lógica de dirección propia (`DELETE /api/addresses/:id`)
- ✅ Creación/deduplicación automática al hacer checkout

---

## Frontend

### Autenticación
- ✅ Registro (`/registro`)
- ✅ Inicio de sesión (`/login`)
- ✅ Persistencia de sesión (refresh token en localStorage, access token en memoria)
- ✅ Protección de rutas (redirección a `/login` con param `?redirect=`)
- ✅ Recuperación de contraseña (`/recuperar-contrasena`)

### Catálogo de productos
- ✅ Nombre, precio, categoría, descripción
- ✅ **Stock visible** en cards (chip en esquina superior derecha: gris=disponible, naranja=últimas unidades, rojo=sin stock) y en la PDP (texto de disponibilidad bajo el precio)

### Carrito de compras
- ✅ Agregar productos
- ✅ Modificar cantidades
- ✅ Eliminar productos
- ✅ Vaciar carrito
- ✅ Visualización del total (con descuentos de promociones aplicados)
- ✅ Confirmación de compra — checkout por pasos (envío → pago → confirmación)
- ✅ Detección de tarjeta por BIN (Visa, Mastercard, Amex, Diners) + validación Luhn
- ✅ Tarjetas de prueba dummy con auto-fill
- ✅ Pantalla de confirmación post-compra con resumen de la orden (mostrada inline en `CartPageClient`)
- ✅ Email de confirmación enviado al usuario

### Perfil de usuario
- ✅ Ver perfil (`/perfil`)
- ✅ Editar datos personales (nombre, apellido, email) — tab "Datos"
- ✅ Gestión de direcciones — tab "Mis direcciones"
- ✅ Cambio de contraseña con código por email — tab "Seguridad"
- ✅ Sección "Mis compras" accesible desde perfil y navbar — tab "Mis compras" (`/perfil?tab=compras`)

### Órdenes de compra
- ✅ Ver órdenes del usuario — accesible desde `/perfil?tab=compras` y link "Mis compras" en el menú del navbar
- ✅ Ver detalle de una orden — dentro del perfil via query param `?orden=ID`
- ⚠️ No hay rutas standalone `/mis-ordenes` ni `/mis-ordenes/[id]`. El historial vive en la pestaña del perfil.

### Panel de gestión (dueño y superadmin)
- ✅ Link "Panel de gestión" en navbar — visible para `dueno` y `superadmin`
- ✅ Auth guard: redirige a `/login` si no autenticado, a `/` si no tiene rol autorizado
- ✅ **Crear / editar / eliminar productos** — `/dashboard/productos`
- ✅ **Crear / editar / eliminar categorías** — `/dashboard/categorias`
- ✅ **Crear / editar / eliminar promociones** — `/dashboard/promociones`
- ✅ **Crear / editar / eliminar slides del home** — `/dashboard/slider`

### Panel administrador (superadmin)
- ✅ **Ver usuarios** — `/dashboard/usuarios` (visible solo para `superadmin`)
- ✅ **Editar usuarios** — `/dashboard/usuarios/[id]/editar` (nombre, apellido, email, teléfono, roles, estado activo/inactivo)
- ✅ **Crear usuario** — `/dashboard/usuarios/nuevo`
- ✅ **Baja lógica de usuario** — botón "Dar de baja" en la tabla (soft delete `activo: false` via `DELETE /api/users/:id`)
- ⚠️ **Recuperar usuarios/productos dados de baja** — no hay UI ni endpoint de reactivación (el formulario de edición permite marcar `activo: true` manualmente)
- ❌ **Ver órdenes del sistema** — no hay UI (el endpoint ya existe: `GET /api/orders`)

### Estado global
- ✅ Redux Toolkit + Context API (patrón adaptador)
- ✅ Persistencia en localStorage (carrito scopeado por usuario + refresh token)
- ✅ Resolución de conflicto de carrito guest vs. sesión anterior (modal)

---

## Documentación obligatoria

- ✅ **README** en el root con: instalación, ejecución, variables de entorno, dependencias
- ❌ **Documentación de endpoints** (rutas, métodos HTTP, parámetros, respuestas JSON)
- ❌ **PDF de requerimientos funcionales** actualizados para entregar

---

## Resumen de pendientes críticos

| Área | Tarea | Dónde |
|------|-------|-------|
| Frontend | Panel superadmin — ver órdenes del sistema | nueva sección en `/dashboard/usuarios` o ruta `/dashboard/ordenes` |
| Docs | Documentación de endpoints + PDF | a coordinar |