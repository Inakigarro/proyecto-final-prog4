# 🛒 Proyecto Final — Programación 4

Aplicación web de e-commerce desarrollada como proyecto final de la **Tecnicatura en Programación** (Programación 4).

---

## 📋 Descripción

Plataforma de tienda online que permite a los usuarios explorar productos, gestionar su carrito de compras y realizar órdenes de compra. El sistema cuenta con autenticación JWT, control de acceso basado en roles (RBAC) y una API REST para la comunicación entre el cliente y el servidor.

---

## 🚀 Stack tecnológico

| Capa | Tecnología |
|---|---|
| Base de datos | MongoDB Atlas + Mongoose |
| Backend | Node.js + Express + TypeScript |
| Frontend | React 18 + Vite + TypeScript |
| UI | Material UI (MUI v5) |
| Autenticación | JWT (access token en memoria + refresh token) |

---

## 📁 Estructura del proyecto

```
proyecto-final-prog4/
├── server/                  # Backend — API REST
│   └── src/
│       ├── config/          # Conexión a MongoDB
│       ├── controllers/     # Lógica de cada endpoint
│       ├── middlewares/     # verificarToken, errorHandler
│       ├── models/          # Modelos Mongoose + interfaces TypeScript
│       ├── routes/          # Definición de rutas Express
│       ├── seeders/         # Carga de datos iniciales
│       ├── types/           # Interfaces compartidas del backend
│       └── index.ts         # Entry point
└── client/                  # Frontend — React
    └── src/
        ├── api/             # Instancia Axios con interceptores JWT
        ├── components/      # Componentes reutilizables
        ├── context/         # AuthContext — usuario, login, logout
        ├── pages/           # Una carpeta/archivo por vista
        ├── router/          # AppRouter — rutas protegidas y públicas
        └── types/           # Interfaces del frontend
```

---

## ⚙️ Instalación y configuración local

### Requisitos previos

- Node.js v18 o superior
- npm
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (o instancia local de MongoDB)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Inakigarro/proyecto-final-prog4.git
cd proyecto-final-prog4
```

### 2. Configurar el servidor

```bash
cd server
npm install
```

Crear el archivo `.env` en la carpeta `server/` con las siguientes variables:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=tu_clave_secreta
JWT_REFRESH_SECRET=tu_clave_refresh_secreta
```

### 3. Configurar el cliente

```bash
cd ../client
npm install
```

### 4. Cargar datos iniciales

```bash
cd ../server
npm run seed
```

Esto crea el usuario **SuperAdmin** y carga los permisos y roles iniciales en la base de datos.

---

## ▶️ Ejecución

### Servidor (modo desarrollo)

```bash
cd server
npm run dev
```

El servidor corre en `http://localhost:4000`.

### Cliente (modo desarrollo)

```bash
cd client
npm run dev
```

El cliente corre en `http://localhost:3000`.

---

## 🔐 Autenticación y roles

El sistema utiliza autenticación **JWT stateless**:

- El `accessToken` se guarda en memoria (nunca en localStorage).
- El `refreshToken` se guarda en localStorage para persistir la sesión entre recargas.
- El interceptor de Axios renueva el `accessToken` automáticamente ante un error 401.

El control de acceso está basado en **RBAC dinámico**:

- Cada `User` tiene uno o más `Role`.
- Cada `Role` tiene uno o más `Permission`.
- Cada `Permission` define un recurso y una acción permitida.

---

## 🛍️ Funcionalidades principales

- Registro e inicio de sesión de usuarios
- Gestión de productos e ítems
- Carrito de compras (órdenes de compra con detalles)
- Métodos de pago administrados por el sistema
- Descuentos aplicables a nivel de ítem y de orden
- Panel de administración con control de roles y permisos

---

## 👥 Equipo

| Nombre | GitHub |
|---|---|
| Iñaki Garro | [@Inakigarro](https://github.com/Inakigarro) |
| Franco Armando | [@FrancoArmando](https://github.com/francoarmando1911) |
| Rocío Medina | [@RocioMedina](https://github.com/rociomedina1998) |
| Natalia Medina | [@NataliaMedina](https://github.com/natiimedina-20) |
| Juan Pedro Caffa | [@JuanPedroCaffa](https://github.com/Juantus) |

---

## 📄 Licencia

Proyecto académico — Tecnicatura en Programación - 2026.
