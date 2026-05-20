import { Router } from "express";
import * as categoryController from "../controllers/categoryController";
import { verificarToken } from "../middlewares/auth";
import { verificarSuperAdmin } from "../middlewares/verificarSuperAdmin";

const router = Router();

// Lectura: pública, relacionada con el catálogo de productos
router.get("/", categoryController.listar);
router.get("/:id", categoryController.obtenerPorId);

// Escritura: solo superadmin
router.post("/",    verificarToken, verificarSuperAdmin, categoryController.crear);
router.put("/:id",  verificarToken, verificarSuperAdmin, categoryController.actualizar);
router.delete("/:id", verificarToken, verificarSuperAdmin, categoryController.eliminar);

export default router;
