import { Router } from "express";
import * as categoryController from "../controllers/categoryController";
import { verificarToken } from "../middlewares/auth";
import { verificarSuperAdmin } from "../middlewares/verificarSuperAdmin";

const router = Router();

router.use(verificarToken);
router.use(verificarSuperAdmin);

router.get("/", categoryController.listar);
router.get("/:id", categoryController.obtenerPorId);
router.post("/", categoryController.crear);
router.put("/:id", categoryController.actualizar);
router.delete("/:id", categoryController.eliminar);

export default router;
