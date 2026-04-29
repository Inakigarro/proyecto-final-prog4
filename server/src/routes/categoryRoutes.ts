import { Router } from "express";
import * as categoryController from "../controllers/categoryController";
import { verificarToken } from "../middlewares/auth";
import { verificarSuperAdmin } from "../middlewares/verificarSuperAdmin";

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Lectura: cualquier usuario autenticado
router.get("/", categoryController.listar);
router.get("/:id", categoryController.obtenerPorId);

// Escritura: solo superadmin
router.post("/", verificarSuperAdmin, categoryController.crear);
router.put("/:id", verificarSuperAdmin, categoryController.actualizar);
router.delete("/:id", verificarSuperAdmin, categoryController.eliminar);

export default router;
