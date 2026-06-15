import { Router } from "express";
import { CategoryService } from "../services/rbac/category.service";
import { crearCategoryController } from "../controllers/categoryController";
import { verificarToken } from "../middlewares/auth";
import { verificarRoles } from "../middlewares/verificarRoles";
import { ROL_SUPERADMIN, ROL_DUENO } from "../config/constants";

const router = Router();
const controller = crearCategoryController(new CategoryService());

// Lectura: pública, relacionada con el catálogo de productos
router.get("/",    controller.listar);
router.get("/:id", controller.obtenerPorId);

// Escritura: superadmin o dueño
router.post("/",    verificarToken, verificarRoles(ROL_SUPERADMIN, ROL_DUENO), controller.crear);
router.put("/:id",  verificarToken, verificarRoles(ROL_SUPERADMIN, ROL_DUENO), controller.actualizar);
router.delete("/:id", verificarToken, verificarRoles(ROL_SUPERADMIN, ROL_DUENO), controller.eliminar);

export default router;
