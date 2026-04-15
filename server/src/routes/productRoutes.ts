import { Router } from "express";
import {
  crear,
  listar,
  obtenerPorId,
  actualizar,
  eliminar,
} from "../controllers/productController";

const router = Router();

router.get("/", listar);
router.get("/:id", obtenerPorId);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

export default router;