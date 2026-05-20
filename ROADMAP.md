# ROADMAP — De Junior avanzado a Semi-Senior avanzado

Plan de mejoras concretas para el backend (`server/`), organizadas en fases por prioridad.
Cada tarea referencia el archivo y línea exactos donde aplicar el cambio.

---

## ✅ Fase 1 — Bugs críticos (completada)

---

### ✅ 1.1 Proteger las mutaciones de productos con auth + superadmin

**Modelo de acceso implementado:**
- `GET /api/products` y `GET /api/products/:id` → públicos
- `GET /api/categories` y `GET /api/categories/:id` → públicos
- `POST / PUT / DELETE /api/products` → `verificarToken` + `verificarSuperAdmin`
- `POST / PUT / DELETE /api/categories` → `verificarToken` + `verificarSuperAdmin`
- `POST /api/cart/validate` y `POST /api/cart/checkout` → `verificarToken`

**Fix adicional:** `categoryRoutes.ts` tenía `router.use(verificarToken)` que bloqueaba
también los GETs. Se corrigió al mismo tiempo.

**Archivos modificados:**
- `server/src/routes/productRoutes.ts`
- `server/src/routes/categoryRoutes.ts`

---

### ✅ 1.2 Checkout en transacción MongoDB

El rollback manual fue reemplazado por una sesión Mongoose real. Todos los `create`,
`findOneAndUpdate` y `find` dentro de `checkout()` reciben `{ session }`. Si cualquier
operación falla, `abortTransaction()` revierte todo automáticamente sin riesgo de stock
inconsistente.

**Fix adicional:** `IPurchaseOrder` no tenía `createdAt` y `updatedAt` en su interfaz a
pesar de usar `{ timestamps: true }`. Se agregaron para eliminar el cast `as IPurchaseOrder & { createdAt: Date }`.

**Archivos modificados:**
- `server/src/services/rbac/cart.service.ts`
- `server/src/models/purchaseOrder.ts`

---

### ✅ 1.3 Reset token eliminado del response body

`forgotPassword` ya no expone el token en la respuesta HTTP. Devuelve el mismo mensaje
genérico tanto si el email existe como si no, para no revelar información.

**Archivo modificado:** `server/src/controllers/authController.ts`

---

### ✅ 1.4 Campo `descripcion` agregado al modelo Item

Necesario para el filtro de búsqueda del frontend. Se propagó a todos los archivos relacionados.
También se aprovechó para exponer `stock` en `ItemResponse`, que el frontend necesita para
mostrar disponibilidad.

**Archivos modificados:**
- `server/src/models/Item.ts` — campo `descripcion?: string` con maxlength 500
- `server/src/types/item.dtos.ts` — `descripcion` y `stock` en `CrearItemDto` e `ItemResponse`
- `server/src/services/rbac/product.service.ts` — `mapearAResponseDto` actualizado

---

### ✅ 1.5 Paginación y búsqueda en el listado de productos

`GET /api/products` acepta ahora query params opcionales:

| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `pagina` | number | 1 | Número de página (1-indexado) |
| `limite` | number | 20 | Items por página (max 100) |
| `q` | string | — | Texto libre: busca en nombre, descripción y nombre de categoría |

Response envelope:
```json
{
  "datos": [...],
  "total": 42,
  "pagina": 1,
  "limite": 20,
  "totalPaginas": 3
}
```

La búsqueda por categoría resuelve primero los IDs de categorías que coinciden con el texto,
luego filtra ítems con `$or`. El `countDocuments` y el `find` se ejecutan en paralelo con
`Promise.all` para evitar dos round-trips secuenciales.

**Archivos modificados:**
- `server/src/types/item.dtos.ts` — `FiltrosProducto` y `ProductosPageResponse`
- `server/src/types/rbac/product.service.interface.ts` — `listarProductos` reemplaza `getAllProducts`
- `server/src/services/rbac/product.service.ts` — implementación con paginación y regex
- `server/src/controllers/productController.ts` — parseo de query params

---

## ✅ Fase 2 — Calidad de código (completada)

No cambian la arquitectura, pero elevan la confiabilidad y mantenibilidad del código.

---

### ✅ 2.1 Extraer `calcularMontoTotal` a un único utilitario compartido

**Problema:** La misma función está copiada en tres archivos:
- `server/src/models/purchaseOrder.ts`
- `server/src/models/purchaseOrderDetail.ts` (lógica equivalente en el pre-save hook)
- `server/src/services/rbac/cart.service.ts`

Un cambio en la lógica de descuentos requiere editar los tres lugares.

**Archivo nuevo:** `server/src/utils/descuentos.ts`

```typescript
export function aplicarDescuentos(montoBase: number, descuentos: number[]): number {
  const factor = descuentos.reduce((acc, d) => acc * (1 - d / 100), 1);
  return parseFloat((montoBase * factor).toFixed(2));
}
```

Luego reemplazar las tres implementaciones con un import a esta función.

---

### ✅ 2.2 Eliminar los `as unknown as` reemplazándolos con tipos correctos

**Problema:** El cast `as unknown as` bypasea el sistema de tipos. Aparece en:
- `cart.service.ts` — `detalle.item as unknown as IItem`
- `product.service.ts` — castings en el populate de categorías

**Causa raíz:** Cuando Mongoose popula un campo, su tipo en la interfaz sigue siendo `ObjectId`
aunque en runtime sea el documento completo. La solución es definir un tipo para el documento
populado:

```typescript
// Para PurchaseOrderDetail con item populado:
type PurchaseOrderDetailPopulado = Omit<IPurchaseOrderDetail, 'item'> & { item: IItem };

// Para IItem con category populada:
type ItemPopulado = Omit<IItem, 'category'> & { category: ICategory[] };
```

---

### ✅ 2.3 Tipar `usuario` en `refreshToken` en lugar de usar `as any`

**Archivo:** `server/src/controllers/authController.ts`

```typescript
// Antes:
const usuario = tokenGuardado.usuario as any;

// Después: tipo local para el documento populado
type RefreshTokenPopulado = Omit<IRefreshToken, 'usuario'> & { usuario: IUser };
const tokenConUsuario = tokenGuardado as unknown as RefreshTokenPopulado;
```

---

### ✅ 2.4 Agregar validación de variables de entorno al arranque

**Problema:** Si `JWT_SECRET` o `MONGODB_URI` no están definidas, el servidor arranca igual
y falla en runtime con un error críptico.

**Archivo nuevo:** `server/src/config/env.ts`

```typescript
const VARS_REQUERIDAS = ['JWT_SECRET', 'MONGODB_URI', 'SUPERADMIN_PASSWORD'] as const;

export function validarEnv(): void {
  for (const v of VARS_REQUERIDAS) {
    if (!process.env[v]) {
      throw new Error(`Variable de entorno requerida no definida: ${v}`);
    }
  }
}
```

Llamar `validarEnv()` en `index.ts` antes de cualquier otra inicialización.

---

### ✅ 2.5 Reemplazar `console.log` / `console.error` con el logger estructurado

**Tarea:** Buscar todos los `console.log` y `console.error` en `server/src/` y reemplazarlos
con llamadas al logger estructurado que ya existe en `config/logger.ts`.

```bash
# Buscar ocurrencias:
grep -rn "console\." server/src/
```

---

## ✅ Fase 3 — Validación de inputs con Zod (completada)

**Por qué Zod:** Genera tipos TypeScript automáticamente desde los schemas, evitando duplicar
la definición entre el schema de validación y el tipo. Es la opción más ergonómica en proyectos
TypeScript puros.

---

### ✅ 3.1 Instalar Zod

```bash
cd server && npm install zod
```

---

### ✅ 3.2 Crear schemas de validación

**Archivo nuevo:** `server/src/schemas/auth.schemas.ts`

```typescript
import { z } from 'zod';

export const RegisterSchema = z.object({
  nombre: z.string().min(2).max(50),
  apellido: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  fechaNacimiento: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato: dd/MM/YYYY'),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
```

**Archivo nuevo:** `server/src/schemas/cart.schemas.ts`

```typescript
import { z } from 'zod';
import { Types } from 'mongoose';

export const CartItemSchema = z.object({
  itemId: z.string().refine(id => Types.ObjectId.isValid(id), 'ObjectId inválido'),
  cantidad: z.number().int().min(1),
});

export const CheckoutSchema = z.object({
  metodoPagoId: z.string().refine(id => Types.ObjectId.isValid(id), 'ObjectId inválido'),
  items: z.array(CartItemSchema).min(1),
  descuentos: z.array(z.number().min(0).max(100)).optional().default([]),
});
```

**Archivo nuevo:** `server/src/schemas/product.schemas.ts`

```typescript
import { z } from 'zod';
import { Types } from 'mongoose';

export const CrearItemSchema = z.object({
  nombre: z.string().min(3).max(100),
  descripcion: z.string().max(500).optional(),
  precioUnitario: z.number().positive(),
  stock: z.number().int().min(0).optional(),
  category: z.array(z.string().refine(id => Types.ObjectId.isValid(id), 'ObjectId inválido')).min(1),
});
```

---

### ✅ 3.3 Crear middleware genérico de validación

**Archivo nuevo:** `server/src/middlewares/validar.ts`

```typescript
import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validar = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const resultado = schema.safeParse(req.body);
    if (!resultado.success) {
      res.status(400).json({
        message: 'Datos inválidos',
        errores: resultado.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = resultado.data;
    next();
  };
```

---

### ✅ 3.4 Aplicar el middleware en las rutas

```typescript
// authRoutes.ts
router.post('/register', limiter, validar(RegisterSchema), authController.register);
router.post('/login',    limiter, validar(LoginSchema),    authController.login);

// productRoutes.ts
router.post('/', verificarToken, verificarSuperAdmin, validar(CrearItemSchema), productController.crear);

// cartRoutes.ts
router.post('/validate', verificarToken, validar(ValidarCarritoSchema), cartController.validar);
router.post('/checkout', verificarToken, validar(CheckoutSchema),       cartController.checkout);
```

Con esto, los controllers pueden eliminar todas las validaciones manuales de campos
(`if (!email || !password)`), ya que el middleware garantiza que el body está bien formado.

---

## ✅ Fase 4 — Inyección de dependencias (patrón simple) (completada)

**Objetivo:** Desacoplar los controllers de la instanciación de servicios para permitir
testeo unitario real sin hackear imports.

No es necesario usar un framework de DI como InversifyJS. El patrón factory es suficiente.

---

### ✅ 4.1 Convertir los controllers a factories

```typescript
// server/src/controllers/productController.ts

import { IProductService } from '../types/rbac/product.service.interface';

export const crearProductController = (servicio: IProductService) => ({
  listar: async (req, res, next) => { /* usa servicio */ },
  obtenerPorId: async (req, res, next) => { /* usa servicio */ },
  crear: async (req, res, next) => { /* usa servicio */ },
  actualizar: async (req, res, next) => { /* usa servicio */ },
  eliminar: async (req, res, next) => { /* usa servicio */ },
});
```

```typescript
// server/src/routes/productRoutes.ts

import { ProductService } from '../services/rbac/product.service';
import { crearProductController } from '../controllers/productController';

const controller = crearProductController(new ProductService());

router.get('/',    controller.listar);
router.get('/:id', controller.obtenerPorId);
router.post('/',    verificarToken, verificarSuperAdmin, controller.crear);
// ...
```

En tests:

```typescript
const mockServicio = { listarProductos: jest.fn(), getProductById: jest.fn(), /* ... */ };
const controller = crearProductController(mockServicio);
// Testear sin tocar la BD
```

Aplicar el mismo patrón a los 7 controllers.

**Implementado:** `product`, `cart`, `user`, `role`, `permission`, `category`.

**`authController` — diferido:** usa modelos Mongoose directamente (sin servicio propio).
Convertirlo requiere extraer un `AuthService` completo, que está fuera del alcance de esta
fase. Los tests de sus endpoints (Fase 5.3) se cubren con integración contra
`mongodb-memory-server`, donde no se necesita mock del servicio.

**Corrección adicional:** `category.service.interface.ts` tenía nombres de métodos
desactualizados (e.g., `createCategory` → `crear`). Se reescribió la interfaz como
`ICategoryService` con los métodos reales, y se agregó `implements ICategoryService` a
`CategoryService`.

---

## ✅ Fase 5 — Tests (completada)

Sin tests, el código no puede considerarse de nivel Semi-Senior.

**Resultado:** 34 tests passing (10 unitarios + 24 integración). 0 failures.

---

### ✅ 5.1 Configurar Jest + ts-jest

```bash
cd server && npm install -D jest ts-jest @types/jest
```

`server/jest.config.ts`:
```typescript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/seeders/**'],
};
```

---

### ✅ 5.2 Tests unitarios de servicios (prioridad alta)

Hacer primero la Fase 4 (DI) para poder pasar mocks sin complicaciones.

**Casos mínimos para `CartService`:**
- `validateCart` con carrito vacío → lanza error
- `validateCart` con item inexistente → `disponible: false`
- `validateCart` con stock insuficiente → `disponible: false`
- `validateCart` con todo OK → `carritoValido: true`, totales correctos
- `checkout` con stock insuficiente → la transacción aborta, sin orden creada

**Casos mínimos para `ProductService`:**
- `listarProductos` sin filtro → devuelve primera página con `totalPaginas` correcto
- `listarProductos` con `q` → filtra por nombre y categoría
- `listarProductos` con `pagina` fuera de rango → nunca lanza, devuelve array vacío

**Casos mínimos para el utilitario `aplicarDescuentos` (Fase 2.1):**
- Sin descuentos → devuelve el monto base
- Descuento del 50% → mitad exacta
- Dos descuentos del 50% → un cuarto (acumulativo, no aditivo)

---

### ✅ 5.3 Tests de integración de endpoints (prioridad media)

```bash
npm install -D supertest @types/supertest mongodb-memory-server
```

**Endpoints mínimos a cubrir:**
- `POST /api/auth/register` — happy path y campos faltantes
- `POST /api/auth/login` — credenciales válidas e inválidas
- `POST /api/auth/refresh` — token válido y token expirado
- `GET /api/products` — respuesta paginada sin auth
- `GET /api/products?q=texto` — filtra correctamente
- `POST /api/products` — sin token → 401, con token de usuario → 403, con superadmin → 201

**Cobertura objetivo:** 70% de líneas en `controllers/` y `services/`.

---

## Fase 6 — Documentación de API con Swagger

---

### 6.1 Instalar dependencias

```bash
cd server && npm install swagger-jsdoc swagger-ui-express
npm install -D @types/swagger-jsdoc @types/swagger-ui-express
```

### 6.2 Montar la UI en desarrollo

```typescript
// server/src/index.ts (solo si NODE_ENV !== 'production')
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

### 6.3 Prioridad de documentación

1. `/api/auth/*` — flujo completo de autenticación
2. `/api/products` — paginación, filtros, response envelope
3. `/api/cart/*` — DTOs de validate y checkout

---

## Estado general

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1.1 | Auth en mutaciones de productos y categorías | ✅ Completo |
| 1.2 | Checkout en transacción MongoDB | ✅ Completo |
| 1.3 | Reset token eliminado del response | ✅ Completo |
| 1.4 | Campo `descripcion` en Item | ✅ Completo |
| 1.5 | Paginación y búsqueda en productos | ✅ Completo |
| 2 | Calidad de código (DRY, tipado, logging, env vars) | ✅ Completo |
| 3 | Validación de inputs con Zod | ✅ Completo |
| 4 | Inyección de dependencias (factory pattern) | ✅ Completo |
| 5 | Tests unitarios e integración | ✅ Completo |
| 6 | Documentación Swagger | ⏳ Pendiente |

**Orden recomendado para lo que queda:** 6

La Fase 4 (DI) debe hacerse antes de los tests de integración (5.3) porque los simplifica
considerablemente. Los tests unitarios del utilitario `aplicarDescuentos` (5.2) se pueden
empezar apenas se complete la Fase 2.1, sin esperar a la DI.

---

## Lo que NO está en este plan (y por qué)

- **Repository pattern:** La DI de Fase 4 resuelve el problema de testeabilidad con menor
  overhead. Un repository agregaría una capa extra sin beneficio real para este tamaño de proyecto.

- **API versioning (`/api/v1/`):** No hay breaking changes planificados. Agregarlo ahora sería
  over-engineering.

- **Contenedor de DI (InversifyJS, tsyringe):** El patrón factory de Fase 4 es suficiente y
  no requiere decorators ni configuración adicional.
