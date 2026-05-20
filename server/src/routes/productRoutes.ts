import { Router } from "express";
import * as productController from "../controllers/productController";
import { verificarToken } from "../middlewares/auth";
import { verificarSuperAdmin } from "../middlewares/verificarSuperAdmin";

const router = Router();

// Lectura: pública, cualquier usuario anónimo puede ver el catálogo
router.get("/", productController.listar);
router.get("/:id", productController.obtenerPorId);

// Escritura: solo superadmin
router.post("/",    verificarToken, verificarSuperAdmin, productController.crear);
router.put("/:id",  verificarToken, verificarSuperAdmin, productController.actualizar);
router.delete("/:id", verificarToken, verificarSuperAdmin, productController.eliminar);

export default router;