import express from "express";
import {
  getPedidosDisponibles,
  asignarPedido,
} from "../controllers/pedido.controller.js";
import verifyJWT from "../middlewares/jwt.js";

const router = express.Router();

router.get("/disponibles", verifyJWT, getPedidosDisponibles);
router.put("/asignar/:id", verifyJWT, asignarPedido);

export default router;
