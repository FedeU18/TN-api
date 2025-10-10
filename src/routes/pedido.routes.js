import express from "express";
import {
  getPedidosDisponibles,
  asignarPedido,
  monitorPedido,
  actualizarEstadoPedido,
} from "../controllers/pedido.controller.js";
import verifyJWT from "../middlewares/jwt.js";

const router = express.Router();

router.get("/disponibles", verifyJWT, getPedidosDisponibles);
router.put("/asignar/:id", verifyJWT, asignarPedido);
router.get("/monitor/:id", verifyJWT, monitorPedido);
router.put("/estado/:id", verifyJWT, actualizarEstadoPedido);

export default router;
