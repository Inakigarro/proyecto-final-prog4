import { Router } from "express";
import { CategoryService } from "../services/rbac/category.service";
import { crearCategoryController } from "../controllers/categoryController";
import { verificarToken } from "../middlewares/auth";
import { verificarSuperAdmin } from "../middlewares/verificarSuperAdmin";

const router = Router();
const controller = crearCategoryController(new CategoryService());

// Lectura: pública, relacionada con el catálogo de productos
router.get("/",    controller.listar);
router.get("/:id", controller.obtenerPorId);

// Escritura: solo superadmin
router.post("/",    verificarToken, verificarSuperAdmin, controller.crear);
router.put("/:id",  verificarToken, verificarSuperAdmin, controller.actualizar);
router.delete("/:id", verificarToken, verificarSuperAdmin, controller.eliminar);

export default router;
