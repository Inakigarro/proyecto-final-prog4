import { Router } from "express";
import { ProductService } from "../services/rbac/product.service";
import { crearProductController } from "../controllers/productController";
import { verificarToken } from "../middlewares/auth";
import { verificarSuperAdmin } from "../middlewares/verificarSuperAdmin";
import { validar } from "../middlewares/validar";
import { CrearItemSchema, ActualizarItemSchema } from "../schemas/product.schemas";

const router = Router();
const controller = crearProductController(new ProductService());

// Lectura: pública, cualquier usuario anónimo puede ver el catálogo
router.get("/",    controller.listar);
router.get("/:id", controller.obtenerPorId);

// Escritura: solo superadmin
router.post("/",    verificarToken, verificarSuperAdmin, validar(CrearItemSchema),      controller.crear);
router.put("/:id",  verificarToken, verificarSuperAdmin, validar(ActualizarItemSchema), controller.actualizar);
router.delete("/:id", verificarToken, verificarSuperAdmin,                              controller.eliminar);

export default router;
