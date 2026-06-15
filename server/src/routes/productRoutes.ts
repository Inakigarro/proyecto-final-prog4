import { Router } from "express";
import { ProductService } from "../services/rbac/product.service";
import { crearProductController } from "../controllers/productController";
import { verificarToken } from "../middlewares/auth";
import { verificarRoles } from "../middlewares/verificarRoles";
import { validar } from "../middlewares/validar";
import { CrearItemSchema, ActualizarItemSchema } from "../schemas/product.schemas";
import { ROL_SUPERADMIN, ROL_DUENO } from "../config/constants";

const router = Router();
const controller = crearProductController(new ProductService());

// Lectura: pública, cualquier usuario anónimo puede ver el catálogo
router.get("/",    controller.listar);
router.get("/:id", controller.obtenerPorId);

// Escritura: superadmin o dueño
router.post("/",    verificarToken, verificarRoles(ROL_SUPERADMIN, ROL_DUENO), validar(CrearItemSchema),      controller.crear);
router.put("/:id",  verificarToken, verificarRoles(ROL_SUPERADMIN, ROL_DUENO), validar(ActualizarItemSchema), controller.actualizar);
router.delete("/:id", verificarToken, verificarRoles(ROL_SUPERADMIN, ROL_DUENO),                              controller.eliminar);

export default router;
