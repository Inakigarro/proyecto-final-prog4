import { Router } from "express";
import * as productController from "../controllers/productController";

const router = Router();

router.get("/", productController.listar);
router.get("/:id", productController.obtenerPorId);
router.post("/", productController.crear);
router.put("/:id", productController.actualizar);
router.delete("/:id", productController.eliminar);

export default router;