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
- ✅ Roles implementados: `usuario` (cliente), `superadmin` (administrador) y `dueno` (gestión de catálogo)

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
- ✅ Métodos de pago (`GET /api/cart/payment-methods`)
- ✅ Carrito scopeado por usuario en localStorage (`techpoint:cart:{userId}`)
- ⚠️ **No hay modelo `Carrito` persistido en MongoDB.** El TPI exige `Carrito` como modelo mínimo. El carrito actual vive solo en el cliente. Evaluar si el docente acepta esta arquitectura o si hay que agregar persistencia.

### Órdenes de compra
- ✅ Generación de orden (`POST /api/cart/checkout`) — descuento atómico de stock
- ✅ Asociación al usuario y persistencia de ítems comprados (modelos `PurchaseOrder` + `PurchaseOrderDetail`)
- ✅ Cálculo del total (hooks `pre-save` en los modelos)
- ✅ Email de confirmación de compra (nodemailer/SMTP)
- ✅ Cliente: consultar sus órdenes (`GET /api/orders/me`)
- ✅ Cliente: ver detalle de una orden (`GET /api/orders/me/:id`)
- ✅ Admin: ver todas las órdenes (`GET /api/orders`)
- ✅ Admin: ver detalle de cualquier orden (`GET /api/orders/:id`)

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
- ❌ **Stock no se muestra** en cards ni en la página de detalle — el campo existe en el backend pero no se incluye en el tipo `Producto` del frontend ni se renderiza

### Carrito de compras
- ✅ Agregar productos
- ✅ Modificar cantidades
- ✅ Eliminar productos
- ✅ Vaciar carrito
- ✅ Visualización del total (con descuentos de promociones aplicados)
- ✅ Confirmación de compra — checkout por pasos (envío → pago → confirmación)
- ✅ Detección de tarjeta por BIN (Visa, Mastercard, Amex, Diners) + validación Luhn
- ✅ Tarjetas de prueba dummy con auto-fill
- ✅ Página de confirmación post-compra con resumen de la orden
- ✅ Email de confirmación enviado al usuario

### Perfil de usuario
- ✅ Ver perfil (`/perfil`)
- ✅ Editar datos personales (nombre, apellido, email)
- ✅ Gestión de direcciones
- ✅ Sección "Mis compras" accesible desde perfil y navbar

### Órdenes de compra
- ✅ Ver órdenes del usuario — página `/mis-ordenes`
- ✅ Ver detalle de una orden — página `/mis-ordenes/[id]`
- ✅ Link "Mis compras" en dropdown de usuario del navbar

### Panel de gestión (dueño)
- ✅ Link "Panel de gestión" en navbar — visible solo para el rol `dueno`
- ✅ Auth guard: redirige a `/login` si no autenticado, a `/` si no tiene rol `dueno`
- ✅ **Crear / editar / eliminar productos** — `/dashboard/productos`
- ✅ **Crear / editar / eliminar categorías** — `/dashboard/categorias`
- ✅ **Crear / editar / eliminar promociones** — `/dashboard/promociones`

### Panel administrador (superadmin)
- ❌ **Ver usuarios** — no hay UI (el endpoint existe)
- ❌ **Editar usuarios** — no hay UI (el endpoint existe)
- ❌ **Baja lógica de usuario** — no hay UI (el endpoint existe)
- ❌ **Recuperar usuarios/productos dados de baja** — no hay UI ni endpoint de reactivación
- ❌ **Ver órdenes del sistema** — no hay UI (el endpoint ya existe: `GET /api/orders`)

### Estado global
- ✅ Redux Toolkit + Context API (patrón adaptador)
- ✅ Persistencia en localStorage (carrito scopeado por usuario + refresh token)

---

## Documentación obligatoria

- ❌ **README** en el root con: instalación, ejecución, variables de entorno, dependencias
- ❌ **Documentación de endpoints** (rutas, métodos HTTP, parámetros, respuestas JSON)
- ❌ **PDF de requerimientos funcionales** actualizados para entregar

---

## Resumen de pendientes críticos

| Área | Tarea | Dónde |
|------|-------|-------|
| Backend | Endpoint reactivar usuario/producto dado de baja (PATCH activo: true) | `server/src/` |
| Frontend | Mostrar stock en catálogo y PDP | `card.tsx`, `PanelInfo.tsx`, tipos |
| Frontend | Panel superadmin — ver/editar/baja de usuarios, ver órdenes del sistema | nueva ruta `/admin` |
| Docs | README en el root | `README.md` |
| Docs | Documentación de endpoints + PDF | a coordinar |