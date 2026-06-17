# TechPoint — Proyecto Final · Programación 4

Aplicación web de e-commerce desarrollada como proyecto final de la **Tecnicatura en Programación**.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Base de datos | MongoDB Atlas + Mongoose 8 |
| Backend | Node.js + Express 4 + TypeScript 5 |
| Frontend | Next.js 16 (App Router) + React 19 + TypeScript 5 |
| Estado global | Redux Toolkit 2 |
| Autenticación | JWT (access token 15 min + refresh token 30 días) |
| Email | nodemailer / SMTP (confirmación de compra, reset y cambio de contraseña) |
| Subida de imágenes | multer (almacenamiento base64 en MongoDB) |

---

## Estructura del proyecto

```
/
├── server/          # Backend — API REST Express
│   └── src/
│       ├── config/         # Conexión a MongoDB, variables de entorno, multer, logger
│       ├── controllers/    # Handlers HTTP por recurso
│       ├── middlewares/    # verificarToken, verificarRoles, validar (Zod), errorHandler
│       ├── models/         # Esquemas Mongoose + interfaces TypeScript
│       ├── routes/         # Routers Express por recurso
│       ├── schemas/        # Schemas de validación Zod
│       ├── seeders/        # Carga de datos iniciales
│       ├── services/       # Lógica de negocio (RBAC, carrito, email)
│       ├── types/          # DTOs e interfaces compartidas
│       ├── utils/          # Cálculo de descuentos y promociones
│       ├── app.ts          # Factory de la app Express (importable en tests)
│       └── index.ts        # Entry point
└── client/front-tpi/ # Frontend — Next.js App Router
    └── src/
        ├── app/            # Páginas y layouts (App Router)
        ├── component/      # Componentes React reutilizables
        ├── context/        # AuthContext, CartContext (adaptadores Redux)
        ├── lib/            # apiFetch, DTOs del cliente, clientes SSR
        └── store/          # Redux Toolkit (authSlice, cartSlice, middleware)
```

---

## Instalación y configuración local

### Requisitos

- Node.js v18 o superior
- npm
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) o instancia local de MongoDB
- Cuenta Gmail con [App Password](https://myaccount.google.com/apppasswords) para el envío de emails (opcional en desarrollo)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Inakigarro/proyecto-final-prog4.git
cd proyecto-final-prog4
```

### 2. Configurar y arrancar el backend

```bash
cd server
npm install
```

Crear el archivo `server/.env`:

```env
PORT=4000
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=cambiar_por_clave_secreta_segura
SUPERADMIN_PASSWORD=contraseña_superadmin_segura
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGIN=http://localhost:3000

# SMTP — Gmail con App Password (16 chars sin espacios)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-gmail@gmail.com
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM=TechPoint <tu-gmail@gmail.com>
```

Cargar datos iniciales:

```bash
npm run seed            # SuperAdmin + roles + permisos
npm run seed:products   # Catálogo inicial de productos
npm run seed:promotions # Promociones iniciales
npm run seed:addresses  # Direcciones de ejemplo para el SuperAdmin
```

Iniciar en modo desarrollo:

```bash
npm run dev   # http://localhost:4000
```

### 3. Configurar y arrancar el frontend

```bash
cd ../client/front-tpi
npm install
```

Crear el archivo `client/front-tpi/.env.local`:

```env
BACKEND_URL=http://localhost:4000
```

Iniciar en modo desarrollo:

```bash
npm run dev   # http://localhost:3000
```

---

## Comandos disponibles

### Backend (`cd server`)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Modo desarrollo con hot-reload (ts-node + nodemon) |
| `npm run build` | Compila TypeScript a `/dist` |
| `npm start` | Producción desde `/dist` |
| `npm run seed` | Carga SuperAdmin, roles y permisos iniciales |
| `npm run seed:products` | Carga catálogo inicial de productos |
| `npm run seed:promotions` | Carga promociones iniciales |
| `npm run seed:addresses` | Carga direcciones de ejemplo para el SuperAdmin |
| `npm test` | Ejecuta todos los tests |
| `npm run test:unit` | Solo tests unitarios |
| `npm run test:integration` | Solo tests de integración |
| `npm run test:coverage` | Tests con reporte de cobertura |

### Frontend (`cd client/front-tpi`)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Modo desarrollo con hot-reload |
| `npm run build` | Build de producción |
| `npm start` | Sirve el build de producción |
| `npm run lint` | ESLint |

---

## Autenticación y roles

El sistema usa **JWT stateless**:

- `accessToken` en memoria (nunca en localStorage).
- `refreshToken` en localStorage (`techpoint:refresh_token`). Se rota en cada renovación.
- Refresh automático cada 14 min (el access token dura 15 min).

**RBAC dinámico** — tres roles estándar:

| Rol | Acceso |
|-----|--------|
| `usuario` | Navegación, compras, perfil |
| `dueno` | Todo lo anterior + panel de gestión (productos, categorías, promociones, slides) |
| `superadmin` | Acceso total — también gestiona usuarios, roles y permisos |

---

## Rutas principales

| URL | Descripción |
|-----|-------------|
| `/` | Home con slider y productos destacados |
| `/login` | Inicio de sesión |
| `/registro` | Registro de cuenta |
| `/recuperar-contrasena` | Solicitud de reset de contraseña por email |
| `/search-result` | Resultados de búsqueda por texto o categoría |
| `/product-detail-page/[id]` | Página de detalle de producto |
| `/promociones` | Listado de promociones activas |
| `/promociones/[id]` | Detalle de una promoción |
| `/carrito` | Carrito + flujo de checkout (envío → pago → confirmación) |
| `/perfil` | Perfil del usuario (datos, direcciones, compras, seguridad) |
| `/quienes-somos` | Información del equipo |
| `/dashboard` | Panel de gestión (requiere rol `dueno` o `superadmin`) |

---

## Equipo

| Nombre | GitHub |
|--------|--------|
| Iñaki Garro | [@Inakigarro](https://github.com/Inakigarro) |
| Franco Armando | [@FrancoArmando](https://github.com/francoarmando1911) |
| Rocío Medina | [@RocioMedina](https://github.com/rociomedina1998) |
| Natalia Medina | [@NataliaMedina](https://github.com/natiimedina-20) |
| Juan Pedro Caffa | [@JuanPedroCaffa](https://github.com/Juantus) |

---

## Licencia

Proyecto académico — Tecnicatura en Programación · 2026.
