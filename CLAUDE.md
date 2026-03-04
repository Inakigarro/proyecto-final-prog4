# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Aplicación web completa desarrollada como proyecto del curso Programacion 4 (Tecnicatura en Programación).

## Stack

- **MongoDB** + **Mongoose** — base de datos, enfoque code-first (los modelos definen el esquema)
- **Express** — API REST en el servidor
- **React 18** + **Vite** — frontend, enfoque mobile-first
- **Material UI (MUI v5)** — librería de componentes
- **Node.js** — runtime del servidor
- **TypeScript** — usado en `server/` y `client/`

## Convenciones de código

- Comentarios en funciones y clases: **cortos, descriptivos y directos**
- Tipar siempre parámetros, retornos e interfaces — ayuda a compañeros sin experiencia en apps completas
- Código y comentarios en **español**

## Arquitectura

**Estructura:** Monorepo con `/server` (backend) y `/client` (frontend) como subproyectos independientes.

**Package manager:** npm

**Autenticación:** JWT stateless — el servidor no guarda estado de sesión.

**Roles y permisos (RBAC dinámico):**
- `User` → tiene muchos `Role` (ObjectId[])
- `Role` → tiene muchos `Permission` (ObjectId[])
- `Permission` → `{ nombre, recurso, accion }` (entidad en BD, no hardcodeada)

## Estructura del server

```
server/src/
├── config/        # conexión a MongoDB
├── models/        # modelos Mongoose + interfaces TypeScript
├── controllers/   # lógica de cada endpoint
├── routes/        # definición de rutas Express
├── middlewares/   # verificarToken (JWT), errorHandler
├── seeders/       # seed.ts — carga datos iniciales
├── types/         # interfaces compartidas del backend
└── index.ts       # entry point
```

## Estructura del client

```
client/src/
├── api/           # axios.ts — instancia con interceptores JWT (access token en memoria)
├── components/
│   └── layout/    # AppLayout.tsx — navbar + drawer responsive
├── context/       # AuthContext.tsx — usuario, login, logout, register
├── pages/         # una carpeta/archivo por vista
├── router/        # AppRouter.tsx — RutaProtegida y RutaPublica
└── types/         # interfaces del frontend
```

**Gestión de tokens en el client:**
- `accessToken` se guarda en memoria (variable en `axios.ts`), nunca en localStorage
- `refreshToken` se guarda en `localStorage` para persistir la sesión entre recargas
- El interceptor de Axios renueva el `accessToken` automáticamente ante un 401

## Comandos

```bash
# Server
cd server && npm install
npm run dev      # recarga con ts-node + nodemon
npm run build    # compila a /dist
npm start        # producción desde /dist
npm run seed     # carga SuperAdmin y permisos iniciales

# Client
cd client && npm install
npm run dev      # Vite dev server en http://localhost:5173
npm run build    # build de producción
```
